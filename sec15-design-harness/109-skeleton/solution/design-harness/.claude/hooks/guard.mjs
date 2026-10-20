// PreToolUse 훅. exit 2 + stderr = 차단.
// 1) 승인은 사람만: Claude가 approve 실행·승인 파일 수정 못 하게 막음
// 2) wireframe·system 승인 전 피그마 쓰기 차단
import { figmaBlockReason } from '../../harness/lib.mjs';

const input = JSON.parse((await new Promise((res) => {
  let s = '';
  process.stdin.on('data', (c) => (s += c)).on('end', () => res(s));
})) || '{}');
const tool = input.tool_name ?? '';
const ti = input.tool_input ?? {};

const deny = (msg) => {
  process.stderr.write(msg + '\n');
  process.exit(2);
};

function guardFigma(what) {
  let reason;
  try {
    reason = figmaBlockReason();
  } catch (e) {
    reason = `상태 확인 실패: ${e.message}`; // 판단 못 하면 막는다
  }
  if (reason) deny(`피그마 쓰기 차단 (${what}). ${reason}\n사용자에게 승인을 요청하고 멈출 것.`);
}

const APPROVE_CMD = /\b(npm|pnpm|yarn|bun)\s+(run\s+)?approve\b|cli\.mjs["']?\s+approve\b|\.approvals\.json/;
const FIGMA_API_WRITE = /api\.figma\.com/i;
const HTTP_WRITE = /(-X|--request)\s*["']?(POST|PUT|PATCH|DELETE)|\s(-d|--data[\w-]*|-F|--form)[\s=]/i;
// 이름이 이렇게 시작하는 피그마 MCP 도구만 읽기로 본다. 나머지는 쓰기로 취급(모르면 막음).
const FIGMA_READ_ONLY = /^(get_|list_|search_|whoami$)/;

if (/^(Write|Edit|MultiEdit|NotebookEdit)$/.test(tool)) {
  if (/\.approvals\.json$/.test(ti.file_path ?? ti.notebook_path ?? '')) {
    deny('승인 파일은 사람이 `npm run approve`로만 바꾼다.');
  }
} else if (tool === 'Bash') {
  const c = ti.command ?? '';
  if (APPROVE_CMD.test(c)) deny('승인은 사용자가 직접 `npm run approve <단계>`를 실행해야 한다. 승인을 요청하고 멈출 것.');
  if (FIGMA_API_WRITE.test(c) && HTTP_WRITE.test(c)) guardFigma('Figma REST API');
} else if (/^mcp__.*figma/i.test(tool)) {
  const op = tool.split('__').pop();
  if (!FIGMA_READ_ONLY.test(op)) guardFigma(op);
}
process.exit(0);
