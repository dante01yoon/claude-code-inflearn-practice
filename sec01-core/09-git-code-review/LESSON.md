# 섹션 1 · Git·GitHub를 클로드 코드로 (브랜치·커밋·합치기, /code-review)

실습: `start/`에서 동료가 만든 브랜치 `feat/quiet-hour`(역 카드에 "가장 한가한 때" 추가, 버그 있음)를 만드는 스크립트 실행 → 설명받기 → `/code-review` → 고치기 → 커밋·main에 합치기 → `solution/`. 마지막으로 실제 GitHub 저장소 [dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d)에서 브랜치 → push → PR → `/code-review 1` → 머지.
촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.296, auto 모드, Opus 5.5 · medium, 2026-10-11. 앞부분은 원격 저장소 없이 내 컴퓨터 안에서, 뒷부분은 GitHub CLI(`gh`)로 로그인된 상태에서 실제 PR.

## 시작하기
```bash
cd start
cp .env.example .env
./make-teammate-branch.sh     # main 커밋 + feat/quiet-hour 브랜치(동료 커밋 1개)를 만들고 그 브랜치로 이동
git log --oneline --all --graph
claude
```

## 입력한 것 (그대로)
```text
지금 브랜치는 main이랑 뭐가 달라?      # git diff + 계산까지 돌려 보고 "5개 역 모두 02시가 가장 한가한 때(운행 안 하는 시간)"를 짚음
/code-review                         # "Running in the background as @code-review" → 27초 → 버그 2 · 테스트 1 · 정리 2
찾은 문제 고쳐 줘                     # stats.mjs로 계산 분리 + 테스트 추가, 5개 모두 고침 · 테스트 5개 통과
커밋하고 main에 합쳐 줘               # 브랜치 커밋 → fast-forward로 main에 합침 → 테스트 다시 실행
```
짧은 프롬프트만으로 충분해서 자세한 버전은 쓰지 않았습니다.
고친 뒤에도 다섯 역 모두 "01시대"가 나와서, 클로드가 "막차 무렵이라 의미 있는 답이 아닐 수 있다, 기준을 정해 달라"고 했습니다.

결과 보기: `cd solution && python3 -m http.server 8000` (02시대 → 01시대)

## 실제 GitHub에서: PR 올리고 리뷰받고 머지하기
실습 앱 저장소: https://github.com/dante01yoon/seoul-live-3d (이 수업의 결과 상태에서 시작) · 영상의 PR: https://github.com/dante01yoon/seoul-live-3d/pull/1

내 계정으로 따라 하려면 저장소를 내 계정으로 가져와(Fork 또는 새 저장소에 push) 쓰세요. `gh auth login`으로 로그인되어 있어야 클로드가 `gh`로 PR을 만들 수 있습니다.
```bash
git clone https://github.com/<내 계정>/seoul-live-3d.git && cd seoul-live-3d
cp .env.example .env
git remote -v
claude
```
```text
역 카드 아래에 데이터 기준 달을 작게 표시해 줘. 브랜치 만들어서 커밋하고 PR까지 올려 줘
  # 브랜치 feat/summary-data-month · 커밋 → git push에서 확인 질문(ask 규칙 "Bash(git push *)"가 auto 모드보다 우선) → Yes → gh로 PR #1 생성
/code-review 1                        # PR 번호를 대상으로 · 27초 · 지금 데이터로는 버그 없음, 데이터가 바뀔 때 대비한 지적 5건
고칠 게 있으면 고쳐서 PR에 올리고 머지까지 해 줘
  # 1~4번 수정(usageMonth 함수 · 그 달 일수로 나누기 · 데이터 점검 · 테스트 2개) → 375px 화면 확인 → push 확인 → Yes → 커밋 추가 → gh로 머지
```
```bash
/exit
git pull -q && git log --oneline --graph -6   # 머지 커밋 아래 브랜치 커밋 2개
```
짧은 프롬프트만으로 충분해서 자세한 버전은 쓰지 않았습니다. 5번(같은 문구가 카드마다 반복)은 요청과 맞지 않아 클로드가 그대로 두었습니다.

## 핵심 정리 (공식 문서 확인)
| 항목 | 내용 | 근거 |
|---|---|---|
| PR | "create a pr for my changes"처럼 평소 말로. gh로 PR을 만들면 세션이 PR과 연결되고 `claude --from-pr <번호>`로 다시 열 수 있음 | [common-workflows](https://code.claude.com/docs/en/common-workflows) |
| gh | GitHub를 쓴다면 `gh` CLI 설치 권장 | [best-practices](https://code.claude.com/docs/en/best-practices) |
| `/code-review` | 형식 `/code-review [low\|medium\|high\|xhigh\|max\|ultra] [--fix] [--comment] [대상]`. 기본 범위: upstream보다 앞선 커밋 + 커밋 안 한 변경. 백그라운드 서브에이전트, CLAUDE.md를 따름 | [code-review](https://code.claude.com/docs/en/code-review) |
| `--fix` 주의 | 백그라운드 `--fix`로 고친 내용은 `/rewind`로 되돌릴 수 없음 → Git 사용 | code-review, [checkpointing](https://code.claude.com/docs/en/checkpointing) |
| ultra | 클라우드에서 여러 리뷰어가 검증, 5~10분, Pro/Max 무료 3회 후 사용량 크레딧 | [ultrareview](https://code.claude.com/docs/en/ultrareview) |
| 커밋 서명 | 기본으로 Co-Authored-By 줄이 붙음(`attribution` 설정) | [settings-reference](https://code.claude.com/docs/en/settings-reference) |

PR 자동 리뷰(GitHub Actions)는 섹션 10에서 다룹니다.

## 연습 과제
1. `/code-review high`처럼 깊이를 올려 다시 돌려 보고, 찾는 개수가 어떻게 달라지는지 비교해 보세요.
2. 새 브랜치에서 일부러 작은 버그를 넣고 `/code-review --fix`로 바로 고치게 한 뒤, `git diff`로 무엇이 바뀌었는지 확인하세요.
