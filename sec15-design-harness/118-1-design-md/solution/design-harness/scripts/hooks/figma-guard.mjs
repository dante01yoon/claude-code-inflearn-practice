#!/usr/bin/env node
// PreToolUse hook for Figma MCP tools. Exit 2 blocks the call and tells Claude why.
// Writes need: approved design system + the exact file key (or plan key for a new file) in figma.json.
import fs from "node:fs";
import { exists, hasWorkspace, paths, projectName, readJson } from "../lib.mjs";

const WRITE_CALL = /\.(create\w*|appendChild|insertChild|remove|setBoundVariable\w*|resize\w*|setRangeFills|setRangeFontSize|swapComponent|detachInstance|setProperties|setValueForMode|setStyleIdAsync|set\w*Async)\(|\.(fills|strokes|name|characters|x|y|cornerRadius|itemSpacing|padding\w+|layoutMode|opacity|visible|fontSize|fontName)\s*=[^=]/;

export function decide(event, p) {
  const tool = event.tool_name.split("__").pop();
  const input = event.tool_input ?? {};
  const figma = exists(p.figma) ? readJson(p.figma) : {};
  const approvals = exists(p.approvals) ? readJson(p.approvals) : {};

  if (tool === "use_figma" && input.code?.startsWith("// harness:read-only") && !WRITE_CALL.test(input.code)) {
    return figma.fileKey && input.fileKey !== figma.fileKey
      ? { ok: false, why: `읽기도 figma.json의 파일(${figma.fileKey})만 허용` }
      : { ok: true };
  }
  if (!approvals.system) return { ok: false, why: "디자인 시스템 승인 전에는 Figma에 쓰지 않습니다 (사람이 design-harness approve system --by <이름>)" };
  if (tool === "create_new_file") {
    if (figma.fileKey) return { ok: false, why: `이미 파일이 있습니다(${figma.fileKey}). 새 파일 대신 그 파일을 쓰세요` };
    if (!figma.planKey || input.planKey !== figma.planKey)
      return { ok: false, why: `figma.json의 planKey(${figma.planKey ?? "없음"})와 다른 팀에는 파일을 만들지 않습니다` };
    return { ok: true, write: true };
  }
  if (!figma.fileKey) return { ok: false, why: "figma.json에 fileKey가 없습니다. 사람이 파일 키를 적은 뒤 실행하세요" };
  if (input.fileKey !== figma.fileKey) return { ok: false, why: `figma.json의 파일(${figma.fileKey})이 아닌 곳에는 쓰지 않습니다` };
  return { ok: true, write: true };
}

const isMain = process.argv[1]?.endsWith("figma-guard.mjs");
// A project with the plugin enabled but no work/ folder is not using the harness; leave its Figma alone.
if (isMain && hasWorkspace()) {
  const event = JSON.parse(fs.readFileSync(0, "utf8"));
  const p = paths(projectName());
  const result = decide(event, p);
  if (!result.ok) {
    console.error(`[figma-guard] ${result.why}`);
    process.exit(2);
  }
  if (result.write && exists(p.figma)) {
    // Remember the last write so the verify gate can tell a stale node export.
    const figma = readJson(p.figma);
    figma.lastWriteAt = new Date().toISOString();
    fs.writeFileSync(p.figma, JSON.stringify(figma, null, 2) + "\n");
  }
}
