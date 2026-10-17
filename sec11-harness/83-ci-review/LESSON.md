# 섹션 11 · 83강 검증 하네스 ③ — CI에서 같은 검사, PR 자동 리뷰와 연결

## 이번 수업에서 할 것
- 검증 하네스 세 겹을 정리한다: 고칠 때 훅(82강) · PR 올릴 때 CI · 사람이 보기 전 클로드 리뷰(섹션 10 74강 워크플로).
- 짧은 부탁으로 82강 검사 스크립트(`check.py`)를 그대로 부르는 GitHub Actions 워크플로(`.github/workflows/check.yml`)를 만든다.
- 커밋 → push(ask 규칙 확인) → PR → GitHub에서 CI 결과와 클로드 리뷰(요약 + 인라인 코멘트)를 본다. PR은 머지하지 않는다.

촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.296, 오토 모드(기본), Opus 5.5 · medium, 2026-10-17. 앱: [dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) 브랜치 `sec11-harness`, 이 수업 커밋 `8bdfdb8`, [PR #4](https://github.com/dante01yoon/seoul-live-3d/pull/4)(열림).

## 공식 문서로 확인한 것
| 내용 | 근거 |
|---|---|
| Claude Code GitHub Actions는 저장소 워크플로 안에서 Claude Code를 실행하고, 프롬프트를 주면 모든 GitHub 이벤트에서 자동으로 돌게 할 수 있다 | [GitHub Actions](https://code.claude.com/docs/ko/github-actions) |
| 저장소 루트 `CLAUDE.md`에 리뷰 기준·규칙을 두면 Claude가 PR을 만들고 응답할 때 따른다 | [GitHub Actions · CLAUDE.md에서 프로젝트 표준 정의](https://code.claude.com/docs/ko/github-actions#define-project-standards-in-claude-md) |
| API 키나 OAuth 토큰은 저장소에 커밋하지 말고 GitHub Secrets에 넣어 워크플로에서 참조. 구독 토큰은 `claude setup-token`으로 만들어 `CLAUDE_CODE_OAUTH_TOKEN`에 | [GitHub Actions · 자격 증명 보호](https://code.claude.com/docs/ko/github-actions#protect-your-credentials), [수동 설정](https://code.claude.com/docs/ko/github-actions#manual-setup) |

## 입력한 것 (그대로)
```text
claude
훅에서 돌리는 검사를 GitHub Actions에서도 똑같이 돌게 해 줘. PR을 올리면 결과가 보이게.
커밋하고 main으로 PR 만들어 줘          ← git push에서 ask 규칙 확인 창 → 승인
```

## 화면에서 본 것 (2026-10-17)
- CI 만들기(1분 51초): 클로드가 깨끗하게 새로 받은 저장소에서 테스트·`npm ci` 후 `tsc`가 도는지부터 확인. 검사 내용을 복사하지 않고 `check.py` 하나를 훅과 CI가 같이 쓰게 `--ci <기준 커밋>` 모드를 추가(기준 커밋과 HEAD 사이 바뀐 파일을 문법 → 타입 → 테스트, 첫 실패에서 멈추지 않고 모두 모아 `::error` 주석·작업 요약, 기준이 없으면 추적 파일 전체). `check.yml`: `pull_request`(opened·synchronize·ready_for_review·reopened)와 `workflow_dispatch`, 권한 `contents: read`, checkout(fetch-depth 0) → Node 24 → mcp-server `npm ci` → `check.py --ci ${{ github.event.pull_request.base.sha }}`. 로컬에서 일부러 문법 오류 `.mjs`·깨진 `.json`을 넣어 실패 4건이 잡히는 것도 확인.
- 커밋·PR: `git push`에서 "Ask rule Bash(git push *) overrides auto mode" 확인 창(78강 규칙) → 승인 → `gh`로 main 대상 PR #4, 본문에 커밋별 요약.
- GitHub: 「검증 하네스」 check 통과(작업 11초). 「Claude 코드 리뷰」(섹션 10 워크플로)는 처음엔 저장소에 넣어 둔 토큰 문제로 실패 → 새 토큰으로 바꾸고 다시 돌려 성공(1분 8초). 리뷰 요약: 시간대·KST·`count`, 인증키·RLS, 숫자 표시·노선색·출처를 확인했고 큰 문제는 없음, 지적 몇 가지. 인라인 코멘트(`nearby-places.mjs:5`): 반경 500→300m는 「가까운 장소」 카드만이 아니라 `subway.html`의 `nearOf`(추천에서 장소와 가까운 역 찾기)·`noStation` 문구도 바꾸고, `recommend.mjs:31` 주석("500m")이 낡았다 — 82강에서 놓친 파급.
- PR은 머지하지 않음.

## 파일
- `solution/.github/workflows/check.yml` — CI 워크플로
- `solution/.claude/hooks/check.py` — 훅·Stop·CI 세 모드가 한 파일

## 연습 과제
1. PR 브랜치에서 `stats.mjs`에 문법 오류를 하나 넣고 push해 보세요. 「검증 하네스」 체크가 실패하고, 파일·줄에 `::error` 주석이 붙는지 확인하세요.
2. 리뷰 인라인 코멘트대로 `recommend.mjs:31` 주석을 고치는 커밋을 올리고, 리뷰가 다시 돌 때 그 지적이 사라지는지 보세요.
