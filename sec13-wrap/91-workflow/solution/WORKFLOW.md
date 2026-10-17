# 나만의 워크플로 체크리스트

클로드 코드 실전 강의(섹션 0~12)에서 쓴 것을 작업 하나의 순서로 모았습니다. 새 작업을 시작할 때 위에서부터 훑어보세요. 괄호 안은 그 내용을 다룬 수업입니다.

## 0. 세팅 — 프로젝트마다 한 번
- [ ] 이 템플릿으로 시작: `CLAUDE.md`(늘 지킬 것만, 짧게) · 권한 규칙(allow · ask · deny) · 훅 · 스킬 · 서브에이전트 (섹션 3)
- [ ] 프로젝트가 커지면 루트 `CLAUDE.md`를 폴더별 `CLAUDE.md`와 `.claude/rules/*.md`(`paths`) 경로 규칙으로 나누기 (79강)
- [ ] 검사 훅 두 개: 편집 뒤(PostToolUse) + 답을 끝낼 때(Stop). 통과는 조용히, 실패만 알리기 (82강)
- [ ] 같은 검사를 CI에서도 + PR 자동 리뷰 (83강, 섹션 10)

## 1. 시작
- [ ] `/context`로 무엇이 실렸는지 확인 (78강)
- [ ] 다른 작업으로 넘어가면 `/clear`

## 2. 정하기
- [ ] 짧은 평소 말투로 부탁하기. 빗나가면 빗나간 부분만 자세히
- [ ] 계획 모드(`Shift+Tab` → `⏸ plan mode on`)로 계획을 먼저 보고 승인 (섹션 1)
- [ ] 큰 기능은 인터뷰 → `SPEC.md` → 화면으로 확인할 수 있게 작게 자르기 (80강)

## 3. 만들기
- [ ] 테스트 먼저: 빨강(실패 확인) → 초록 → 다듬기 (81강)
- [ ] 버그는 원인 → 재현 스크립트(틀리면 종료 코드 1) → 고침 → 같은 스크립트로 확인 (84강)
- [ ] 오래 걸리는 일은 `/goal`·백그라운드 세션, 나눌 수 있는 일은 worktree (섹션 8·9)

## 4. 확인
- [ ] 테스트 실패 0
- [ ] 화면으로 직접 확인(브라우저 · Playwright). "브라우저로는 안 봤다"는 답이면 내가 본다
- [ ] `/code-review`로 지적 받고, 이번 작업에 해당하는 것은 고치기

## 5. 저장 · 공유
- [ ] 커밋 → 푸시 → PR (푸시는 확인을 받는 규칙으로)
- [ ] PR의 CI 검사 · 자동 리뷰 통과 확인 (`gh pr checks`)

## 6. 돌아보기
- [ ] `/usage` · 상태 표시줄로 사용량 · 비용 보기 (85강)
- [ ] 같은 실수가 두 번 나오면 규칙 · 훅 · 스킬로 남기기
- [ ] 새 키트 · 하네스는 넣기 전후로 같은 부탁을 재 보고 고르기 📏 (86 · 87강)

실습 자료: [claude-code-inflearn-practice](https://github.com/dante01yoon/claude-code-inflearn-practice) · 예제 앱: [seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) · 플러그인: [claude-code-practice-marketplace](https://github.com/dante01yoon/claude-code-practice-marketplace)
