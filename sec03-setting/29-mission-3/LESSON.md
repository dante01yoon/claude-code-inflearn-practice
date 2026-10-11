# 섹션 3 · 29강 미션 3 — 세팅의 빈칸 두 개 채우기

`start/` = 28강 템플릿([795eb1a](https://github.com/dante01yoon/claude-code-starter-setting/commit/795eb1a)). 영상을 멈추고 먼저 해 본 뒤 풀이를 보세요.

## 미션
1. **screen-checker 서브에이전트** — `/web-page` 스킬이 부르는데 아직 없는 팀원. Playwright로 데스크톱·375px 스크린샷을 찍고 문제만 보고.
2. **data 폴더 보호** — 권한 deny 규칙으로 data/ 수정 금지.
3. **실제로 써 보기** — `/web-page`로 페이지를 만들어 screen-checker가 불리는지 확인하고, 템플릿 저장소에 push.

## 풀이에서 입력한 것 (그대로)

```text
claude
screen-checker 서브에이전트 만들어 줘. Playwright로 페이지를 열어 데스크톱이랑 375px 스크린샷 찍고 문제만 보고하게
data 폴더는 못 고치게 권한 규칙도 넣어 줘
/exit
claude          # 새 에이전트는 세션을 다시 시작해야 목록에 나타남
/web-page 서울 지하철 1~9호선 노선 카드 페이지
/tasks
/exit
```

```bash
git status --short
git add .claude && git commit -qm '미션 3: screen-checker 서브에이전트, data 폴더 쓰기 금지 권한' && git push -q && git log --oneline -2
```

## 결과
- `.claude/agents/screen-checker.md` (model: sonnet, 도구: Read·Glob·Bash + Playwright MCP, 파일 수정 금지) → [solution](solution/.claude/agents/screen-checker.md)
- `/web-page` 실행 중 `screen-checker(Check subway cards page)`가 두 번(확인 → 수정 후 재확인) 불림, 첫 확인 1분
- 클로드를 나갈 때 경고: `Write(/data/**)`·`NotebookEdit(/data/**)`는 파일 권한 검사에 쓰이지 않음 — **`Edit(path)` 규칙 하나가 모든 파일 편집 도구를 막음**. 그래서 템플릿은 `"deny": ["Edit(/data/**)"]`만 남기도록 고침([1e451a5](https://github.com/dante01yoon/claude-code-starter-setting/commit/1e451a5)).
- deny 규칙은 파일 편집 도구만 막습니다. `sed -i`, `>`, `rm` 같은 셸 명령까지 막으려면 훅(24강 block-dangerous.sh)에 규칙을 추가하세요.
- 템플릿 커밋: [ac1e90f](https://github.com/dante01yoon/claude-code-starter-setting/commit/ac1e90f) · `index.html`은 시험으로 만든 페이지라 올리지 않음(solution 폴더에는 참고용으로 포함)
- 주의: 이 페이지의 노선 정보는 클로드가 아는 내용으로 쓴 요약본이며 공식 자료와 대조하지 않았습니다(클로드도 결과 보고에 그렇게 적음). 실제 서비스에는 공식 데이터를 쓰세요.

## 채점 기준
| 항목 | 확인 |
|---|---|
| screen-checker | `.claude/agents/`에 있고 도구가 읽기·Playwright 위주 |
| data 보호 | `Edit(/data/**)` deny · 셸 명령은 훅으로 |
| 실제로 불렸나 | `/web-page` 실행 때 `screen-checker(…)` 표시 |
| 템플릿 갱신 | 커밋·push 완료 |

참고: [Subagents](https://code.claude.com/docs/en/sub-agents) · [Permission rules](https://code.claude.com/docs/en/permissions) · [Hooks](https://code.claude.com/docs/en/hooks)
