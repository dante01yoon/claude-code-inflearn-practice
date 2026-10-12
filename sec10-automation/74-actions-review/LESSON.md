# 섹션 10 · 74강 GitHub Actions로 PR 자동 리뷰 — /code-review --fix와 ultrareview까지

## 이번 수업에서 할 것
- 흐름: PR 올림 → 깃허브 서버가 워크플로 실행 → `anthropics/claude-code-action@v1`이 클로드 실행 → PR에 리뷰 댓글
- 열쇠: 저장소 secret(`CLAUDE_CODE_OAUTH_TOKEN` = `claude setup-token`, 또는 `ANTHROPIC_API_KEY`) + Claude GitHub App 설치. 워크플로에는 이름만(`${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}`)
- PR 전에 내 컴퓨터에서 `/code-review --fix`
- `/code-review ultra`(ultrareview, 연구 미리보기·유료)는 문서로만

## 입력한 것 그대로
```text
claude --permission-mode auto
PR을 올리면 클로드가 자동으로 코드 리뷰를 달아 주게 GitHub Actions 워크플로 만들어 줘. 인증은 구독 토큰 secret으로 할 거야
커밋해 줘
리포트에 지난번 리포트보다 얼마나 바뀌었는지도 같이 보여 줘
/code-review --fix
커밋하고 푸시한 다음 main으로 PR 만들어 줘
```
```text
claude --continue --permission-mode auto
푸시는 됐으니 main으로 PR 만들어 줘
gh pr checks --watch
```
(저장소 주인이 Claude GitHub App 설치 + secret 등록 — 녹화 안 함)
```text
gh pr checks --watch
claude --permission-mode auto
PR #3 리뷰 체크는 성공인데 리뷰 댓글이 하나도 없어. Actions 로그 보고 이유 알려 줘
그럼 워크플로 파일만 main에 먼저 올리고, PR 리뷰를 다시 돌려 줘. PR은 머지하지 말고
claude --continue --permission-mode auto
main에는 올라갔으니 PR 리뷰 다시 돌리고, 끝나면 리뷰 댓글 요약해 줘
```

## 결과 (2026-10-12, Claude Code 2.1.296)
- 워크플로 `.github/workflows/claude-review.yml`(41초): PR opened/synchronize/ready_for_review/reopened, 초안·포크 PR 건너뜀, `pull-requests: write`·`id-token: write`, 한국어 리뷰 지시, `--allowedTools`로 인라인 댓글 도구와 `gh pr comment/diff/view`만. 커밋 3741f7c.
- "지난 리포트와 비교" 기능(2분 41초) → `/code-review --fix`(백그라운드 에이전트, 1분 4초): 문제 6개 찾아 5개 고침(목록 덮어쓰기 경합, 예전 리포트와 비교 시 null, 스크립트 죽음, NaN시간, 이스케이프), 1개는 기존 동작이라 남김. 테스트 131개 통과. 커밋 85f00a0.
- `git push`는 저장소 규칙(`Bash(git push *)` ask)으로 오토 모드에서도 확인 창.
- PR #3 첫 실행 실패: "Claude Code is not installed on this repository" → 앱 설치 + secret 등록 후 다시: 체크 **성공 11초인데 댓글 없음** → 로그: 워크플로 파일이 기본 브랜치(main)와 같아야 실행(보안 검사) → 워크플로만 main에 먼저(6a603eb) → 재실행 → claude 봇 요약 댓글 + 인라인 댓글 1개(`scripts/daily-report.mjs` 52행: `readFile().then(JSON.parse, onRejected)`는 JSON 파싱 오류를 못 잡음). 리뷰 28초, 약 $0.21.
- 참고: 공식 예제는 `code-review@claude-code-plugins` 플러그인 + `/code-review:code-review --comment` 방식. 이 수업의 워크플로는 클로드가 `pr-review-comprehensive` 예제를 바탕으로 직접 쓴 프롬프트 방식.

## ultrareview (문서로만)
`/code-review ultra`(별칭 `/ultrareview`, 연구 미리보기): 클라우드에서 여러 리뷰 에이전트가 찾은 버그를 재현·검증, 5~10분, 실행 전 확인 창(범위·남은 무료 횟수·예상 비용), Pro·Max 무료 3회(1회성) 뒤 리뷰당 약 $5~$25 usage credits. 이 강의에서는 실행하지 않음.

## 공식 문서 (2026-10-12 확인)
- [Claude Code GitHub Actions](https://code.claude.com/docs/ko/github-actions)
- [ultrareview로 버그 찾기](https://code.claude.com/docs/ko/ultrareview)

## 앱 저장소
[dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) PR #3(머지는 로컬 머지), 워크플로 `.github/workflows/claude-review.yml`.
