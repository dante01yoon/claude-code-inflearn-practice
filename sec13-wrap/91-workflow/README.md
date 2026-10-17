# 섹션 13 · 91강 나만의 워크플로 체크리스트

## 이번 수업에서 할 것
- 섹션 0~12에서 쓴 것을 작업 순서대로 **일곱 칸 체크리스트**로 묶는다: 0 세팅 · 1 시작 · 2 정하기 · 3 만들기 · 4 확인 · 5 저장·공유 · 6 돌아보기.
- 서울 라이브 3D에 실제 기능 하나(답 카드에 「하루 평균 승하차 전체 몇 위」)를 그 순서대로 처음부터 PR·CI까지 돌린다.
- 완성한 체크리스트를 스타터 세팅 저장소 [dante01yoon/claude-code-starter-setting](https://github.com/dante01yoon/claude-code-starter-setting)에 `WORKFLOW.md`로 넣고 README에서 연결(커밋 92a3fc9).

촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.296, 오토 모드, Opus 5.5 · medium, 2026-10-17. 앱: [dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) 브랜치 `sec13-wrap`(`sec11-all` 922724e 위), PR [#5](https://github.com/dante01yoon/seoul-live-3d/pull/5)(기준 `sec11-all`, 머지 안 함).

## 체크리스트 (스타터 세팅 `WORKFLOW.md`)
| 칸 | 할 일 | 다룬 수업 |
|---|---|---|
| 0 세팅 | CLAUDE.md(짧게) · 권한 규칙 · 훅 · 스킬, 커지면 폴더별 CLAUDE.md·경로 규칙, 검사 훅(편집 뒤 + Stop), CI | 섹션 3, 79·82·83강 |
| 1 시작 | `/context`로 실린 것 보기, 작업이 바뀌면 `/clear` | 78강 |
| 2 정하기 | 짧게 부탁, 계획 모드, 큰 일은 인터뷰 → SPEC → 작게 자르기 | 섹션 1, 80강 |
| 3 만들기 | 테스트 먼저(빨강 → 초록), 버그는 재현 스크립트부터, 긴 일은 `/goal`·백그라운드·worktree | 81·84강, 섹션 8·9 |
| 4 확인 | 테스트 실패 0, 화면 직접 확인, `/code-review` 지적 중 이번 작업분 고치기 | 섹션 4·10 |
| 5 저장·공유 | 커밋 → 푸시(확인 규칙) → PR → CI·자동 리뷰(`gh pr checks`) | 83강, 섹션 10 |
| 6 돌아보기 | `/usage`·상태 표시줄, 같은 실수는 규칙·훅·스킬로, 새 키트·하네스는 넣기 전후 재 보기 | 85~87강 |

## 입력한 것 (그대로)
```text
git status --short && ls .claude .claude/hooks .claude/skills
claude
/context
(Shift+Tab → ⏸ plan mode on)
답 카드에 이 역이 하루 평균 승하차로 전체 몇 위인지도 보여 줘
(계획 → 1. Yes, and use auto mode)
/code-review
커밋하고 푸시해서 PR 만들어 줘          ← git push 확인 창(ask 규칙)에서 승인
/exit
claude --continue
리뷰 지적 1~3번 고쳐서 PR에 올려 줘
/exit
gh pr checks 5 --watch --interval 10
```
짧은 부탁으로 원하는 결과가 나와 자세한 버전은 쓰지 않았습니다.

## 화면에서 본 것 (녹화 2회, 2026-10-17)
- 0 세팅: `.claude/hooks`(check.py·trace.py), `.claude/skills/tdd`. 1 시작 `/context`: 부탁 전 18.5k/1m, Memory files 2개 2.5k, 스킬 32개 6k.
- 2 계획: 클로드가 답 카드 코드(`renderAnswer`)와 역 항목의 하루 평균 `riders`를 찾아 계획 — 모집단은 역 전체(환승역은 한 역), 노선 칩을 골라도 역 전체 기준, 같은 값은 같은 순위, 0명인 역도 포함.
- 3 만들기: 테스트 먼저 → 「Red confirmed (no export). Now implement.」 → `station-compare.mjs`의 `riderRank` + 답 카드 줄. 1분 44초, 145개 통과. 실제 9월 데이터로 서울역 1위 · 잠실 2위 · 홍대입구 3위 · 강남 5위(529역). 클로드는 「브라우저로는 열어 보지 않았다」고 적음.
- 4 `/code-review`(리뷰 에이전트 1분 3초): 지적 8개 중 이번 작업분 3개 — ① 반올림 전 값으로 순위(화면엔 같은 숫자인데 순위가 다를 수 있음) ② `aria-live` 답 카드라 스크린리더가 같은 순위 문장을 다시 읽음 ③ 그릴 때마다 전체 역을 다시 셈. 나머지는 원래 코드 지적.
- 5 PR: 클로드가 「HEAD가 origin/sec11-all과 같아 main 기준이면 섹션 11 커밋 12개가 딸려 간다」고 보고 `sec11-all` 기준으로 PR #5(3c3c374). `git push`는 ask 규칙 확인 창(「Ask rule Bash(git push *) overrides auto mode」)에서 승인.
- 같은 대화 이어서 리뷰 1~3번 수정(1분 7초): `riderRanks(entries)`로 불러올 때 한 번만 · 화면 반올림 값으로 비교 · 순위 줄은 역·노선이 바뀔 때만 다시 씀, 테스트를 먼저 바꿔 실패 확인 → 146개 통과, 커밋 6b25f4f.
- `gh pr checks`: 검증 하네스 check 13초 · Claude 코드 리뷰 40초 둘 다 통과(두 커밋 모두). PR 화면: 봇 리뷰 「큰 문제는 없습니다」.
- 화면(실제 시각, 인증키는 서버 환경 변수로만): 강남 → 「하루 평균 승하차 148,091명 · 전체 529역 중 5위」.

## 돌아보기 (영상 속 정리)
일한 칸: 계획(순위 기준), 테스트 먼저(두 번 모두), 리뷰(반올림·스크린리더·다시 셈), 화면(사람이 확인), PR(기준 브랜치 판단·CI·자동 리뷰). 이번엔 줄여도 된 칸: 인터뷰·SPEC(작은 기능), 📏 재 보기(새 도구 없음). 체크리스트는 매번 전부가 아니라 빠뜨리지 않게 훑는 용도.

## 파일
- `solution/station-compare.mjs`, `solution/tests/station-compare.test.mjs`, `solution/changes.diff`(922724e → 6b25f4f)
- `solution/WORKFLOW.md` — 스타터 세팅 저장소에 넣은 체크리스트

## 연습 과제
1. 스타터 세팅 저장소를 복사해 새 프로젝트를 만들고, `WORKFLOW.md`의 칸을 내 방식대로 고쳐 보세요.
2. 내 프로젝트의 작은 기능 하나를 체크리스트대로 돌리고, 일한 칸과 건너뛴 칸을 표로 적어 보세요.
