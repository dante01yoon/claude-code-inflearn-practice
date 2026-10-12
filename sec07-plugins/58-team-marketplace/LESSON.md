# 섹션 7 · 58강 팀 마켓플레이스 만들고 설치하기

## 개념
- 마켓플레이스 = 플러그인 목록표(카탈로그). `.claude-plugin/marketplace.json`에 `name`·`owner`·`plugins`(항목마다 `name`·`source`).
- 실수 두 가지: `source` 상대 경로는 저장소 맨 위에서부터(`..` 금지), 목록의 `name` = 플러그인 `plugin.json`의 `name`.
- 설치 범위: user(기본, 내 모든 프로젝트) · project(`.claude/settings.json`, 저장소의 모든 사람) · local(이 저장소의 나만).

## 실습 (실제 입력)
1. 57강 끝 상태 `~/plugins-lab`에서 `ls -A`, `cat .claude-plugin/marketplace.json` (57강에서 클로드가 만든 연습용 목록).
2. `claude` → 짧은 프롬프트:
   ```
   web-kit 플러그인을 팀 마켓플레이스로 만들어서 GitHub에 올려 줘. 저장소 이름은 claude-code-practice-marketplace, 공개로
   ```
   결과: 새 폴더 `~/claude-code-practice-marketplace`(plugins-lab 안의 git 저장소 my-setting과 섞이지 않게 분리), 마켓플레이스 이름 `claude-code-practice-marketplace`, `plugins/web-kit`, README(설치 명령·`extraKnownMarketplaces` 예시), validate 통과, 공개 저장소 push. 짧은 프롬프트로 빗나가지 않아 자세한 프롬프트는 쓰지 않음.
3. 팀원 컴퓨터(설정이 빈 별도 HOME, 같은 계정):
   ```bash
   claude plugin list                     # No plugins installed.
   claude plugin marketplace add dante01yoon/claude-code-practice-marketplace
   claude plugin install web-kit@claude-code-practice-marketplace   # scope: user
   claude plugin list                     # web-kit 0.1.0 ✔ enabled
   claude
   /web-kit:web-page 할 일 목록 페이지. 할 일 추가, 완료 체크, 삭제
   ```
   결과: `index.html` 한 파일, screen-checker(플러그인의 Playwright)로 데스크톱·375px 확인. 브라우저에서 추가·체크 후 새로고침해도 유지(localStorage).

## 저장소
- 마켓플레이스: https://github.com/dante01yoon/claude-code-practice-marketplace
- 녹화 속 클로드가 첫 커밋에 `Co-Authored-By` 줄을 붙여, 녹화 후 커밋 메시지를 고쳐 force-push(cf7b07e). 녹화 HOME `~/.claude/CLAUDE.md`에 작성자 noreply·공동 작성자 줄 금지 규칙을 넣고 다음 녹화부터 적용. 57강에서 plugin.json에 들어간 개인 이메일은 이 수업 녹화 전에 noreply로 바꿈.

## 근거
- [Create a marketplace](https://code.claude.com/docs/en/plugins/create-marketplace) · [Plugins overview — install scopes](https://code.claude.com/docs/en/plugins/overview) · [Install plugins](https://code.claude.com/docs/en/plugins/install)

---
마켓플레이스 저장소: [dante01yoon/claude-code-practice-marketplace](https://github.com/dante01yoon/claude-code-practice-marketplace). `solution/claude-code-practice-marketplace/`는 마켓플레이스 저장소의 첫 커밋(cf7b07e) 상태, `solution/todo/index.html`은 팀원 컴퓨터에서 만든 페이지입니다.
