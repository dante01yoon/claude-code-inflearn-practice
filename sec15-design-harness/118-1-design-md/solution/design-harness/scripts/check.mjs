#!/usr/bin/env node
// Phase gates. A phase whose artifact does not exist yet is "todo", not a failure,
// so the Stop hook only blocks on real mistakes in work already started.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  HUMAN_GATES, PHASES, contrastRatio, exists, hasWorkspace, flattenTokens, gateHash, logFailure, paths, projectName, readJson, report, resolveRef,
} from "./lib.mjs";
import { lintFigma, loadLintInput } from "./lint-figma.mjs";
import { buildDesignMd, designMdCli } from "./design-md.mjs";

const PRD_SECTIONS = ["## 목표", "## 사용자", "## 기능", "## 데이터 출처", "## 범위 밖"];

export function runGates(project) {
  const p = paths(project);
  const approvals = exists(p.approvals) ? readJson(p.approvals) : {};
  const results = [];
  const add = (phase, status, check, message = "") => results.push({ phase, status, check, message });
  const need = (phase, ...files) => {
    const missing = files.filter((f) => !exists(f));
    if (missing.length) add(phase, "todo", "산출물", `${missing.map((f) => path.basename(f)).join(", ")} 없음`);
    return missing.length === 0;
  };

  // prd
  let features = [];
  if (need("prd", p.prd)) {
    const prd = fs.readFileSync(p.prd, "utf8");
    const missing = PRD_SECTIONS.filter((s) => !prd.includes(s));
    features = [...new Set(prd.match(/\bF\d+\b/g) ?? [])];
    if (missing.length) add("prd", "fail", "필수 섹션", missing.join(", "));
    else if (!features.length) add("prd", "fail", "기능 ID", "기능에 F1, F2… ID가 없음");
    else if (!/라이선스|license/i.test(prd)) add("prd", "fail", "데이터 라이선스", "데이터 출처에 라이선스가 없음");
    else add("prd", "pass", `섹션 5개, 기능 ${features.length}개`);
  }

  // research: at least 3 usable references with evidence; bot walls do not count
  if (need("research", p.research, p.references)) {
    const items = readJson(p.references).items;
    const usable = items.filter(
      (r) => !r.blocked && r.observed && r.take && r.screenshot && exists(path.join(p.work, r.screenshot)),
    );
    const blocked = items.filter((r) => r.blocked).length;
    if (usable.length < 3) add("research", "fail", "레퍼런스", `쓸 수 있는 레퍼런스 ${usable.length}개 < 3 (차단 ${blocked}개)`);
    else add("research", "pass", `레퍼런스 ${usable.length}개 (차단돼 뺀 것 ${blocked}개)`);
  }

  // ia: every feature has a screen, flows only point at known screens/states
  let ia;
  if (need("ia", p.ia)) {
    ia = readJson(p.ia);
    const ids = new Set(ia.screens.map((s) => s.id));
    const covered = new Set(ia.screens.flatMap((s) => s.features));
    const uncovered = features.filter((f) => !covered.has(f));
    const badSteps = ia.flows.flatMap((f) => f.steps).filter((step) => {
      const [id, state] = step.split(":");
      const states = ia.screens.find((s) => s.id === id)?.states ?? ia.requiredStates;
      return !ids.has(id) || (state && !states.includes(state));
    });
    if (!ia.screens.length) add("ia", "fail", "화면 목록", "화면이 없음");
    else if (uncovered.length) add("ia", "fail", "기능 커버리지", `화면이 없는 기능: ${uncovered.join(", ")}`);
    else if (badSteps.length) add("ia", "fail", "흐름", `없는 화면/상태: ${badSteps.join(", ")}`);
    else if (ia.screens.some((s) => s.states && !s.states.includes("default")))
      add("ia", "fail", "화면별 상태", "화면별 states에는 default가 있어야 함");
    else add("ia", "pass", `화면 ${ia.screens.length}개, 흐름 ${ia.flows.length}개, 필수 상태 ${ia.requiredStates.length}개`);
  }

  // wireframe: each screen has regions with a clear priority order
  if (ia && need("wireframe", p.wireframes)) {
    const wf = readJson(p.wireframes);
    const problems = [];
    for (const s of ia.screens) {
      const regions = wf[s.id];
      if (!regions?.length) { problems.push(`${s.id}: 와이어프레임 없음`); continue; }
      const prios = regions.map((r) => r.priority);
      if (new Set(prios).size !== prios.length) problems.push(`${s.id}: 우선순위 중복`);
      if (regions.some((r) => !r.content)) problems.push(`${s.id}: 내용 빈 영역`);
    }
    if (problems.length) add("wireframe", "fail", "영역·우선순위", problems.join("; "));
    else add("wireframe", "pass", "모든 화면에 영역과 우선순위");
  }

  // system: tokens resolve, declared contrast pairs pass, components only use tokens, touch size
  if (need("system", p.tokens, p.components, p.copy)) {
    try {
      const tokens = readJson(p.tokens);
      const flat = flattenTokens(tokens);
      const pairs = tokens.$extensions?.["harness.contrastPairs"] ?? [];
      const low = pairs
        .map((pr) => ({ ...pr, ratio: contrastRatio(resolveRef(flat, pr.fg), resolveRef(flat, pr.bg)) }))
        .filter((pr) => pr.ratio < pr.min);
      const comps = readJson(p.components).components;
      const unknown = comps.flatMap((c) => Object.values(c.tokens ?? {}).filter((t) => !flat[t]).map((t) => `${c.name}:${t}`));
      const small = comps.filter((c) => c.interactive && (!c.tokens?.minSize || parseFloat(flat[c.tokens.minSize]?.value) < 44));
      if (low.length) add("system", "fail", "명도 대비", low.map((l) => `${l.fg} on ${l.bg} ${l.ratio.toFixed(2)}:1 < ${l.min}`).join("; "));
      else if (unknown.length) add("system", "fail", "컴포넌트 토큰", `없는 토큰: ${unknown.join(", ")}`);
      else if (small.length) add("system", "fail", "터치 영역", `minSize 44px 미만/누락: ${small.map((c) => c.name).join(", ")}`);
      else add("system", "pass", `토큰 ${Object.keys(flat).length}개, 대비쌍 ${pairs.length}개, 컴포넌트 ${comps.length}개`);
    } catch (e) {
      add("system", "fail", "토큰 해석", e.message);
    }
  }

  // figma: optional until someone gives a file key
  const figma = exists(p.figma) ? readJson(p.figma) : {};
  if (!figma.fileKey) {
    add("figma", "skip", "Figma 파일 키 없음", "figma.json에 fileKey를 넣으면 실행");
  } else if (need("figma", p.nodes)) {
    const nodes = readJson(p.nodes);
    if (nodes.fileKey !== figma.fileKey) add("figma", "fail", "파일 대조", `nodes.json(${nodes.fileKey}) ≠ figma.json(${figma.fileKey})`);
    else if (figma.lastWriteAt && nodes.exportedAt < figma.lastWriteAt)
      add("figma", "fail", "내보내기 오래됨", "마지막 Figma 수정 뒤에 노드를 다시 내보내세요 (export-nodes.js)");
    else add("figma", "pass", `프레임 ${nodes.frames.length}개 내보냄`);
  }

  // verify: machine lint on the exported nodes (or the sample fixture when there is no Figma yet)
  if (exists(p.nodes) && ia) {
    try {
      const findings = lintFigma(loadLintInput(project));
      const errors = findings.filter((f) => f.severity === "error");
      const label = readJson(p.nodes).fixture ? " (예시 픽스처)" : "";
      if (errors.length) add("verify", "fail", `노드 린트${label}`, `오류 ${errors.length}개 — design-harness lint:figma`);
      else add("verify", "pass", `노드 린트${label}`, `오류 0, 경고 ${findings.length}`);
    } catch (e) {
      add("verify", "fail", "노드 린트", e.message);
    }
  } else add("verify", "todo", "노드 린트", "figma/nodes.json 없음");

  if (exists(p.review)) {
    const open = readJson(p.review).checklist.filter((c) => c.score == null);
    if (open.length) add("verify", "wait", "사람 검토", `채점 안 한 항목 ${open.length}개 (review.json)`);
    else add("verify", "pass", "사람 검토 채점 완료");
  }

  // handoff
  if (exists(p.handoff)) {
    const stale = exists(p.nodes) && fs.statSync(p.handoff).mtimeMs < fs.statSync(p.nodes).mtimeMs;
    add("handoff", stale ? "fail" : "pass", "핸드오프 문서", stale ? "노드보다 오래됨 — design-harness handoff" : "");
  } else add("handoff", "todo", "핸드오프 문서", "design-harness handoff");
  // DESIGN.md: generated from the system files, so it must match a fresh build and pass the official lint.
  if (!exists(p.designMd)) add("handoff", "todo", "DESIGN.md", "design-harness design-md");
  else if (exists(p.tokens) && exists(p.components) && exists(p.copy)) {
    try {
      const fresh = buildDesignMd({ project, tokens: readJson(p.tokens), components: readJson(p.components), copy: readJson(p.copy) });
      if (fs.readFileSync(p.designMd, "utf8") !== fresh.markdown)
        add("handoff", "fail", "DESIGN.md 최신", "tokens·components·copy와 다름(원본이 바뀌었거나 손으로 고침) — design-harness design-md");
      else add("handoff", "pass", "DESIGN.md 최신");
      const lint = designMdCli(["lint", p.designMd]);
      const summary = JSON.parse(lint.stdout || "{}").summary ?? {};
      if (lint.status !== 0) add("handoff", "fail", "DESIGN.md 린트", `오류 ${summary.errors ?? "?"}개 — design-harness design-md`);
      else add("handoff", "pass", "DESIGN.md 린트", `오류 0, 경고 ${summary.warnings ?? 0}`);
    } catch (e) {
      add("handoff", "fail", "DESIGN.md", e.message);
    }
  }

  // Human gates: machine pass is not approval.
  for (const phase of HUMAN_GATES) {
    const own = results.filter((r) => r.phase === phase);
    // verify is approved after the review checklist exists, not right after the lint passes.
    if (phase === "verify" && !exists(p.review) && !approvals.verify) {
      if (own.some((r) => r.status === "pass")) add(phase, "todo", "사람 검토", "design-critic 실행 후 design-harness review");
      continue;
    }
    const machineOk = own.some((r) => r.status === "pass") && own.every((r) => r.status === "pass" || r.status === "wait");
    if (machineOk && !approvals[phase]) add(phase, "wait", "사람 승인", `design-harness approve ${phase} --by <이름>`);
    const a = approvals[phase];
    if (a && a.hash && a.hash !== gateHash(p, phase)) add(phase, "wait", "사람 승인", "승인한 뒤 산출물이 바뀜 — 다시 보고 승인");
    else if (a) add(phase, "pass", "사람 승인", `${a.by}, ${a.at.slice(0, 10)}`);
  }
  return results.sort((a, b) => PHASES.indexOf(a.phase) - PHASES.indexOf(b.phase));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes("--hook")) {
    console.log = console.error; // hooks only surface stderr
    if (!hasWorkspace()) process.exit(0); // plugin enabled in a project that has not started a design
  }
  const project = projectName();
  const results = runGates(project);
  const failed = report(results);
  for (const r of results.filter((r) => r.status === "fail")) logFailure(project, r.phase, r.check, r.message);
  console.log(`\n${project}: 실패 ${failed}, 승인 대기 ${results.filter((r) => r.status === "wait").length}`);
  if (failed) {
    // Exit 2 makes a Claude Code Stop hook feed this back instead of ending the turn.
    if (process.argv.includes("--hook")) {
      // Block the stop once; if Claude is already continuing because of this hook, let it end so a
      // failure that needs a person cannot loop forever.
      let event = {};
      try { event = JSON.parse(fs.readFileSync(0, "utf8") || "{}"); } catch {}
      if (event.stop_hook_active) process.exit(0);
      console.error("디자인 게이트 실패 — 위 FAIL을 고치거나, 사람이 해야 하면 그렇게 보고하세요");
      process.exit(2);
    }
    process.exitCode = 1;
  }
}
