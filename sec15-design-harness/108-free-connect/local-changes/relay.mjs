// 로컬 전용 중계 서버 (src/socket.ts를 Node로 옮김). 127.0.0.1:3055에서만 받는다.
import { WebSocketServer, WebSocket } from "ws";
const channels = new Map();
const wss = new WebSocketServer({ host: "127.0.0.1", port: 3055 });
wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "system", message: "Please join a channel to start chatting" }));
  ws.on("close", () => {
    for (const [name, clients] of channels) if (clients.delete(ws))
      for (const c of clients) if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify({ type: "system", message: "A user has left the channel", channel: name }));
  });
  ws.on("message", (raw) => {
    let data; try { data = JSON.parse(raw.toString()); } catch { return; }
    const ch = data.channel;
    if (data.type === "join") {
      if (!ch || typeof ch !== "string") return ws.send(JSON.stringify({ type: "error", message: "Channel name is required" }));
      if (!channels.has(ch)) channels.set(ch, new Set());
      const set = channels.get(ch); set.add(ws);
      ws.send(JSON.stringify({ type: "system", message: `Joined channel: ${ch}`, channel: ch }));
      ws.send(JSON.stringify({ type: "system", message: { id: data.id, result: "Connected to channel: " + ch }, channel: ch }));
      for (const c of set) if (c !== ws && c.readyState === WebSocket.OPEN) c.send(JSON.stringify({ type: "system", message: "A new user has joined the channel", channel: ch }));
      console.log(`join ${ch} (${set.size})`);
      return;
    }
    if (data.type === "message") {
      const set = channels.get(ch);
      if (!set || !set.has(ws)) return ws.send(JSON.stringify({ type: "error", message: "You must join the channel first" }));
      for (const c of set) if (c !== ws && c.readyState === WebSocket.OPEN) c.send(JSON.stringify({ type: "broadcast", message: data.message, sender: "peer", channel: ch }));
    }
    if (data.type === "progress_update") {
      const set = channels.get(ch);
      if (!set || !set.has(ws)) return;
      for (const c of set) if (c !== ws && c.readyState === WebSocket.OPEN) c.send(JSON.stringify(data));
    }
  });
});
console.log("relay listening on 127.0.0.1:3055");
