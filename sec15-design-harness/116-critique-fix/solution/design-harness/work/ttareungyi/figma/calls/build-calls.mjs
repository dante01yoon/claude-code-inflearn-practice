// src/<n>.js 앞에 _lib.js(12번 이후는 _screens.js도)를 붙여 calls/<n>.js를 만든다. 실행: node work/ttareungyi/figma/calls/build-calls.mjs
import fs from "node:fs";
import path from "node:path";
const here = path.dirname(new URL(import.meta.url).pathname);
const lib = fs.readFileSync(path.join(here, "_lib.js"), "utf8");
const scr = fs.readFileSync(path.join(here, "_screens.js"), "utf8");
for (const f of fs.readdirSync(path.join(here, "src")).filter((f) => f.endsWith(".js"))) {
  const body = fs.readFileSync(path.join(here, "src", f), "utf8");
  const screens = parseInt(f) >= 12;
  fs.writeFileSync(path.join(here, f), `// 생성됨: build-calls.mjs (_lib.js${screens ? " + _screens.js" : ""} + src/${f})\n` + lib + "\n" + (screens ? scr + "\n" : "") + body);
  console.log(f);
}
