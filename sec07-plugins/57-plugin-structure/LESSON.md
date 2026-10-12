# 섹션 7 · 57강 플러그인 구조 — 스킬·에이전트·훅·MCP·mod 묶기

## 개념
- 플러그인 = 앱스토어에 올리는 묶음 상품. 스킬·서브에이전트·훅·MCP 서버(·mod)를 상자 하나에 담고, 받는 사람은 상자째 설치·업데이트.
- 폴더 구조(공식 문서): `.claude-plugin/plugin.json`(이름표: name·version·description), `skills/`, `agents/`, `hooks/hooks.json`, `.mcp.json`. 자바스크립트 hooks 모듈이 들어 있으면 mod.
- 이름 규칙: 플러그인 안에서는 앞에 플러그인 이름이 붙음 — `/web-kit:web-page`, `web-kit:screen-checker`, MCP 서버 `plugin:web-kit:playwright`. 에이전트가 쓰는 MCP 도구 이름도 이 규칙대로 바꿔야 함.
- 언제 플러그인으로: 스킬·에이전트·훅·MCP는 플러그인 없이도 동작. 여러 개를 한 덩어리로 나눠 줄 때, 여러 프로젝트에 깔거나 버전을 매겨 내보낼 때. 켜 둔 플러그인은 모든 세션에 들어오고(이름·설명이 매 턴 컨텍스트에), 내 권한으로 실행되니 믿을 수 있는 것만.

## 실습 (실제 입력)
1. `~/plugins-lab`에 섹션 3 세팅 템플릿을 `my-setting`으로 받아 둔 상태.
   ```bash
   ls my-setting/.claude/skills my-setting/.claude/agents
   claude
   ```
2. 짧은 프롬프트:
   ```
   my-setting에 있는 web-page 스킬이랑 screen-checker 에이전트를 묶어서 web-kit 플러그인으로 만들어 줘
   ```
   결과: `plugins-lab/web-kit/`(plugin.json·.mcp.json·skills/web-page·agents/screen-checker), context7·Playwright MCP를 플러그인 `.mcp.json`에 함께 넣고 에이전트 도구 이름을 플러그인 이름 규칙으로 바꿈. 연습용 로컬 marketplace.json도 만듦(58강에서 다룸). 끝까지 설치해 보지는 않았다고 밝힘. 짧은 프롬프트로 빗나가지 않아 자세한 프롬프트는 쓰지 않음.
3. 검사:
   ```bash
   find web-kit -type f | sort
   claude plugin validate ./web-kit      # Validation passed
   ```
4. 빈 폴더에서 이번 세션에만 불러와 써 보기:
   ```bash
   mkdir ../cafe && cd ../cafe
   claude --plugin-dir ../plugins-lab/web-kit
   /web-kit:web-page 카페 주문 페이지. 메뉴는 아메리카노 4500원, 카페라테 5000원, 바닐라라테 5500원. 담으면 합계가 보이게
   ```
   결과: 스킬이 체크리스트 → `index.html` 한 파일, `web-kit:screen-checker`가 플러그인의 Playwright로 데스크톱·375px 확인, 가게 이름은 가정했다고 밝히고 콘솔 오류 하나 수정.
5. 결과 화면: 브라우저에서 아메리카노 2 + 바닐라라테 1 = 14,500원, 새로고침해도 장바구니 유지(localStorage).

## 메모
- 녹화 속 클로드가 plugin.json author에 넣은 개인 이메일은 58강 녹화 전에 noreply로 바꿈(57강 화면에는 이메일이 나오지 않음, 스냅숏 확인).

## 근거
- [Plugins overview](https://code.claude.com/docs/en/plugins/overview) · [Create plugins](https://code.claude.com/docs/en/plugins/create) · [Plugins reference](https://code.claude.com/docs/en/plugins-reference)

---
마켓플레이스 저장소: [dante01yoon/claude-code-practice-marketplace](https://github.com/dante01yoon/claude-code-practice-marketplace). `solution/web-kit/`은 녹화 끝의 web-kit 플러그인(작성자 이메일은 noreply로 바꾼 저장소 버전), `solution/cafe/index.html`은 `--plugin-dir`로 만든 카페 주문 페이지입니다.
