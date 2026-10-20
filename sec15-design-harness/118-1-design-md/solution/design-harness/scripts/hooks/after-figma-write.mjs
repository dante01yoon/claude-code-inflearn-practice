#!/usr/bin/env node
// PostToolUse for use_figma: after a write, the node export is stale until it is redone.
import fs from "node:fs";
import { hasWorkspace } from "../lib.mjs";

if (!hasWorkspace()) process.exit(0);

const event = JSON.parse(fs.readFileSync(0, "utf8"));
if (event.tool_input?.code?.startsWith("// harness:read-only")) process.exit(0);
console.log(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext:
      "Figma가 바뀌었습니다. 이 섹션이 끝나면 export-nodes.js(design-harness path export-nodes)로 노드를 다시 내보내 figma/nodes.json에 저장하고 design-harness lint:figma를 돌리세요.",
  },
}));
