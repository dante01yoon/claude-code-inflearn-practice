#!/usr/bin/env node
// Talk to Figma(무료, 이 컴퓨터 안의 중계 서버 127.0.0.1:3055)로 Plugin API 코드를 보낸다. 공식 MCP 호출 0회.
//   npm run figma -- <code.js> [--data file.json]   코드 실행(--data는 `const DATA = …`로 앞에 붙음), 결과 출력
//   npm run figma -- export                          Screens 페이지 노드 → figma/nodes.json
//   npm run figma -- shots                           Screens 페이지 화면 PNG → figma/screens/*.png
// figma.json: { channel, fileName, fileKey } — 사람이 적는다. 보내기 전에 열린 파일 이름이 fileName과 같은지 확인한다.
// 쓰기(첫 줄이 `// harness:read-only`가 아닌 코드)는 디자인 시스템 사람 승인이 있어야 한다.
import fs from "node:fs";
import path from "node:path";
import { WebSocket } from "ws";
import { ROOT, exists, paths, projectName, readJson } from "../lib.mjs";

export function call(channel, command, params = {}, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const id = Math.random().toString(36).slice(2);
    const ws = new WebSocket("ws://127.0.0.1:3055");
    const timer = setTimeout(() => { ws.close(); reject(new Error(`응답 없음: 채널 ${channel}이 맞는지, 플러그인이 켜져 있는지 확인`)); }, timeoutMs);
    ws.on("error", () => { clearTimeout(timer); reject(new Error("중계 서버(127.0.0.1:3055)가 꺼져 있습니다: node relay.mjs")); });
    ws.on("open", () => ws.send(JSON.stringify({ type: "join", channel, id: "j" })));
    ws.on("message", (raw) => {
      const d = JSON.parse(raw.toString());
      if (d.type === "system" && d.message?.id === "j")
        return ws.send(JSON.stringify({ type: "message", channel, message: { id, command, params: { ...params, commandId: id } } }));
      const m = d.message;
      if (d.type === "broadcast" && m?.id === id && ("result" in m || "error" in m)) {
        clearTimeout(timer); ws.close();
        m.error ? reject(new Error(String(m.error))) : resolve(m.result);
      }
    });
  });
}

export function guard(code, figma, approvals) {
  if (!figma.channel) return "figma.json에 channel이 없습니다. 플러그인 창의 채널 이름을 사람이 적으세요";
  if (!figma.fileName) return "figma.json에 fileName이 없습니다. 그릴 파일 이름을 사람이 적으세요";
  const readOnly = code.startsWith("// harness:read-only");
  if (!readOnly && !approvals.system) return "디자인 시스템 승인 전에는 Figma에 쓰지 않습니다 (npm run approve -- system --by <이름>)";
  return null;
}

const runScript = (ch, code) => call(ch, "run_script", { code });

async function main() {
  const p = paths(projectName());
  const figma = exists(p.figma) ? readJson(p.figma) : {};
  const approvals = exists(p.approvals) ? readJson(p.approvals) : {};
  const args = process.argv.slice(2).filter((a, i, all) => a !== "--project" && all[i - 1] !== "--project");
  const sub = args[0];
  if (!sub) throw new Error("사용: npm run figma -- <code.js> [--data file.json] | export | shots");

  let code;
  if (sub === "shots") {
    code = '// harness:read-only\nconst p = figma.root.children.find((p) => p.name === "Screens"); await p.loadAsync();\n' +
      'return { frames: p.children.filter((f) => f.type === "FRAME" && f.name.includes("/")).map((f) => ({ id: f.id, name: f.name })) };';
  } else if (sub === "export") {
    code = fs.readFileSync(path.join(ROOT, "scripts/figma/export-nodes.js"), "utf8").replace(/^const BUDGET = \d+;/m, "const BUDGET = 1e9;");
  } else {
    code = fs.readFileSync(sub, "utf8");
    const di = args.indexOf("--data");
    if (di !== -1) code = code.replace(/^(\/\/ harness:read-only\n)?/, (m) => `${m}const DATA = ${fs.readFileSync(args[di + 1], "utf8")};\n`);
  }
  const why = guard(code, figma, approvals);
  if (why) { console.error(`[figma-guard] ${why}`); process.exit(2); }

  const open = await runScript(figma.channel, "return figma.root.name");
  if (open !== figma.fileName) { console.error(`[figma-guard] 열린 파일 "${open}" ≠ figma.json의 "${figma.fileName}" — 다른 파일에는 보내지 않습니다`); process.exit(2); }

  const result = await runScript(figma.channel, code);
  if (sub === "export" || sub === "shots") {
    if (result?.error) throw new Error(result.error);
    if (sub === "export") {
      fs.mkdirSync(path.dirname(p.nodes), { recursive: true });
      fs.writeFileSync(p.nodes, JSON.stringify({ fileKey: figma.fileKey ?? null, exportedAt: new Date().toISOString(), frames: result.frames }, null, 2) + "\n");
      console.log(`${result.frames.length}개 프레임 → ${path.relative(ROOT, p.nodes)}`);
    } else {
      const dir = path.join(p.work, "figma", "screens");
      fs.mkdirSync(dir, { recursive: true });
      for (const f of result.frames) {
        const img = await call(figma.channel, "export_node_as_image", { nodeId: f.id, format: "PNG", scale: 2 });
        const file = path.join(dir, f.name.replaceAll("/", "-") + ".png");
        fs.writeFileSync(file, Buffer.from(img.imageData, "base64"));
        console.log(path.relative(ROOT, file));
      }
    }
    return;
  }
  if (!code.startsWith("// harness:read-only")) {
    figma.lastWriteAt = new Date().toISOString(); // verify 게이트가 오래된 노드 내보내기를 알아보게
    fs.writeFileSync(p.figma, JSON.stringify(figma, null, 2) + "\n");
  }
  console.log(typeof result === "string" ? result : JSON.stringify(result, null, 1));
}

if (process.argv[1]?.endsWith("send.mjs")) main().catch((e) => { console.error(e.message); process.exit(1); });
