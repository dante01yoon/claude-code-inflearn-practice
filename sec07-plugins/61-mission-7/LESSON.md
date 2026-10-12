# 섹션 7 · 61강 미션 7 — 스킬 하나 더해 버전 올리고 팀원이 업데이트

## 미션
starter-setting 플러그인에 스킬을 하나 추가(주제 자유, 풀이는 다크 모드) → 채점 케이스(eval) 함께 → plugin.json·marketplace.json 버전 올려 push → 60강의 새 팀원 컴퓨터에서 새 버전을 받아 독서 기록 페이지에 적용.

## 채점표
1. 새 스킬 폴더(`skills/…/SKILL.md`) 2. 채점 케이스가 `claude plugin eval`로 실제로 돈다 3. plugin.json과 marketplace.json 버전이 함께 올랐다 4. 팀원 컴퓨터에서 새 스킬이 실행된다 5. 커밋 작성자(noreply)·메시지가 깨끗하다. 힌트: 프로젝트 설정으로 켠 플러그인은 업데이트 방법이 다르다.

## 정답 풀이 (입력한 것 그대로)
1. 대표 컴퓨터, 마켓플레이스 저장소:
   ```bash
   cat plugins/starter-setting/.claude-plugin/plugin.json    # "version": "0.1.0"
   claude
   ```
   ```
   starter-setting에 다크 모드 스킬 하나 추가하고 채점 케이스도 만들어 줘. 버전 올려서 push까지
   ```
   결과(3분 12초, 이번 회차는 클로드가 영어로 답함): `skills/dark-mode/SKILL.md`(색을 CSS 변수로, prefers-color-scheme + 토글, localStorage `theme`, 새로고침 깜빡임 방지 스크립트), 채점 케이스 `evals/notice-dark/`(공지 페이지 코드를 부탁에 붙여 넣음 — 시작 파일은 `--scaffold`일 때만 줄 수 있어서, 채점 기준 7개), 0.1.0 → 0.2.0(두 파일), 커밋 a4b2ffc push.
2. 케이스가 도는지 한 번씩:
   ```bash
   git log --oneline -3
   claude plugin eval plugins/starter-setting --case '*dark*' --runs 1 --allow-tools Write Edit --no-publish --trust-plugin
   ```
   📏 결과: WITH 1.00 · W/OUT 1.00 · Δ 0.00, 2번 124초 $0.37 → 다크 모드는 플러그인 없이도 만점, 이 케이스로는 플러그인 효과가 안 보임(공식 문서: 양쪽 다 만점이면 플러그인 덕이 아님).
3. 녹화 뒤 직접 고친 커밋 fd1086b: 플러그인 README의 없는 옵션(`--marketplace`) 설치 줄 → `marketplace add` + `install 이름@마켓플레이스`, 채점용 예시 페이지에 클로드가 지어낸 도서관 이름 → 「도서관 공지 (예시)」. 그리고 59강 케이스·`.gitignore` 커밋 70dabd7.
4. 새 팀원 컴퓨터(`team-app`):
   ```bash
   claude plugin update starter-setting@claude-code-practice-marketplace
   # ✘ Plugin "starter-setting" is not installed  (프로젝트 설정으로 켠 플러그인은 설치 기록이 없음)
   claude plugin marketplace update claude-code-practice-marketplace   # ✔
   claude
   /starter-setting:dark-mode index.html     # 첫 세션: Unknown command (개수 표시도 없음)
   ```
   다시 `claude` → `/reload-plugins` → `Reloaded: 1 plugin · 4 skills …` → `/starter-setting:dark-mode index.html`.
   결과(2분 24초): 색 변수·토글(🌙/☀️, aria-label·aria-pressed), screen-checker + Playwright로 1280px·375px 밝은/어두운 화면, 시스템 다크 설정 확인. 다크 모드와 상관없는 기존 문제(쪽수 고친 직후 삭제 첫 클릭 무시)를 찾고 범위 밖이라 안 고쳤다고 밝힘.
5. 결과 화면: 어두운 화면 → 토글로 밝게 → 새로고침해도 테마·책 목록 유지.

## 저장소
- https://github.com/dante01yoon/claude-code-practice-marketplace (starter-setting 0.2.0, 커밋 a4b2ffc · fd1086b)

## 근거
- [Test plugins with evals](https://code.claude.com/docs/en/plugin-evals) · [Install plugins — keep plugins updated](https://code.claude.com/docs/en/plugins/install) · [Plugin loading — enabled in project settings](https://code.claude.com/docs/en/plugins/loading)

---
마켓플레이스 저장소: [dante01yoon/claude-code-practice-marketplace](https://github.com/dante01yoon/claude-code-practice-marketplace). `solution/starter-setting-0.2.0/`은 dark-mode 스킬·notice-dark 채점 케이스가 들어간 0.2.0(커밋 fd1086b), `solution/team-app/index.html`은 다크 모드를 넣은 독서 기록 페이지입니다.
