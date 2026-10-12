# 섹션 7 · 60강 내 세팅을 플러그인으로 — 팀원도 한 번에 설치

## 개념
- 복사해서 나눠 주기 vs 상자째 건네기: 플러그인은 상자째 설치·업데이트.
- 섹션 3 세팅 → 플러그인 (공식 문서 「Add components to a plugin」·「Create plugins — Convert an existing .claude/ setup」):
  | 세팅에 있던 것 | 플러그인에서 |
  |---|---|
  | 스킬·에이전트 | `skills/`·`agents/` 그대로, 이름 앞에 `starter-setting:` |
  | MCP 서버 | `.mcp.json` 그대로 |
  | 훅(settings.json의 `hooks`) | `hooks/hooks.json`, 스크립트 경로는 `"${CLAUDE_PLUGIN_ROOT}"/…` |
  | mod | 같은 `hooks/hooks.json`의 `modules` |
  | CLAUDE.md | ❌ 플러그인 맨 위 CLAUDE.md는 읽지 않음 → 스킬로 |
  | 상태 줄·권한 규칙 | ❌ 플러그인 `settings.json`은 `agent`·`subagentStatusLine`만 받음 |
- 팀 프로젝트의 `.claude/settings.json`에 `extraKnownMarketplaces`(마켓플레이스 위치) + `enabledPlugins`(켤 플러그인). 팀원이 폴더를 믿는다고 답한 뒤에 적용되고, 마켓플레이스 안 상대 경로(`./plugins/…`) 플러그인은 설치 기록 없이 마켓플레이스 사본에서 바로 불러옴(그래서 `claude plugin list`에는 안 나옴).

## 실습 (실제 입력)
1. 대표 컴퓨터, 마켓플레이스 저장소:
   ```bash
   find ../plugins-lab/my-setting -type f -not -path '*/.git/*' | sort
   claude
   ```
   ```
   ../plugins-lab/my-setting 세팅 전체를 starter-setting 플러그인으로 만들어서 이 마켓플레이스에 추가해 줘. push까지
   ```
   결과(2분 20초): `plugins/starter-setting/`(스킬 web-page·seoul-data, 에이전트 reviewer·screen-checker, 훅 3개 → `hooks/hooks.json` + `scripts/`, MCP context7·playwright, 개수 표시 mod), 플러그인이 못 켜는 CLAUDE.md·.gitignore·상태 줄·`Edit(/data/**)` 금지는 `templates/` + 새 `setup` 스킬. validate·mod 테스트 통과, `--plugin-dir` 세션에서 `cat .env`를 훅이 막는 것 확인, setup은 실행 안 해 봤다고 밝힘. 개수 표시는 프로젝트 `.claude/`만 세서 플러그인만 있는 곳에서는 0이라고 알려 줌. 커밋 4d94767 push. 짧은 프롬프트로 빗나가지 않음.
   ```bash
   find plugins/starter-setting -type f | sort
   git log --oneline -3
   ```
2. 새 팀원 컴퓨터(설정이 빈 별도 HOME, 같은 계정), 팀 프로젝트 `team-app`:
   ```bash
   claude plugin list              # No plugins installed.
   cat .claude/settings.json       # extraKnownMarketplaces + enabledPlugins
   claude                          # 폴더 믿기 → 입력창 위 개수 표시(mod) = 플러그인이 켜짐
   ```
   ```
   /starter-setting:setup 이 프로젝트에 넣어 줘
   /starter-setting:web-page 독서 기록 페이지. 책 제목과 읽은 쪽수 추가, 다 읽음 체크
   ```
   결과: CLAUDE.md·.gitignore 생성, settings.json에 상태 줄·data 쓰기 금지 합침(상태 줄 바로 표시). 페이지는 `index.html` 한 파일, 플러그인의 screen-checker가 1280px·375px 확인, 고칠 곳 없음. 그 뒤 `claude plugin list`는 여전히 "No plugins installed."
3. 결과 화면: 실제 책 두 권(어린 왕자 80쪽, 데미안 45쪽 다 읽음) → 「2권 기록 · 1권 다 읽음 · 총 125쪽」, 새로고침해도 유지.

## 저장소
- 플러그인: https://github.com/dante01yoon/claude-code-practice-marketplace/tree/main/plugins/starter-setting
- 메모: 녹화 속 클로드가 플러그인 README에 넣은 첫 설치 줄(`/plugin install starter-setting --marketplace …`)은 없는 옵션이라 61강 녹화 뒤 고침(fd1086b).

## 근거
- [Add components to a plugin](https://code.claude.com/docs/en/plugins/components) · [Create plugins — convert an existing setup](https://code.claude.com/docs/en/plugins/create) · [Require plugins per repository](https://code.claude.com/docs/en/plugins/org) · [Plugin loading](https://code.claude.com/docs/en/plugins/loading)

---
마켓플레이스 저장소: [dante01yoon/claude-code-practice-marketplace](https://github.com/dante01yoon/claude-code-practice-marketplace). `start/team-app/.claude/settings.json`은 새 팀원이 받은 팀 프로젝트 설정, `solution/starter-setting/`은 플러그인 0.1.0(커밋 4d94767), `solution/team-app/`은 setup·web-page 실행 뒤 상태입니다.
