// 로컬 relay로 플러그인에 명령 하나를 보내고 결과를 출력한다. node tff.mjs <channel> <command> [params.json|-]
import { WebSocket } from "ws";
import { readFileSync } from "fs";
const [ch, command, pfile] = process.argv.slice(2);
const params = pfile ? JSON.parse(readFileSync(pfile === "-" ? 0 : pfile, "utf8")) : {};
const id = Math.random().toString(36).slice(2);
const ws = new WebSocket("ws://127.0.0.1:3055");
const timer = setTimeout(() => { console.error("timeout"); process.exit(2); }, 120000);
ws.on("open", () => ws.send(JSON.stringify({ type: "join", channel: ch, id: "j" })));
ws.on("message", (raw) => {
  const d = JSON.parse(raw.toString());
  if (d.type === "system" && d.message?.id === "j") return ws.send(JSON.stringify({ type: "message", channel: ch, message: { id, command, params: { ...params, commandId: id } } }));
  const m = d.message;
  if (d.type === "broadcast" && m?.id === id && ("result" in m || "error" in m)) {
    clearTimeout(timer);
    ws.close();
    // pipe stdout is async: exit only after the write flushes
    process.stdout.write(JSON.stringify(m.error ? { error: m.error } : m.result, null, 1) + "\n", () => process.exit(m.error ? 1 : 0));
  }
});
