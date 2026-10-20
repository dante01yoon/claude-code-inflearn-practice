# design-harness

Claude Code에서 디자이너가 **PRD → 리서치 → 정보 구조 → 와이어프레임 → 디자인 시스템 → Figma 화면 → 검증 → 핸드오프**까지 가는 작업 틀.

```bash
npm install
npm run check   # 단계별 게이트 (PASS / FAIL / TODO / WAIT / SKIP)
npm test        # 하네스 자체 테스트 (Figma 없이 예시 노드로)
```
Claude Code에서 `/design-flow`로 시작한다. 자세한 규칙은 `CLAUDE.md`.

- 기계 검사(`npm run lint:figma`): 토큰 밖 색·글자·간격·모서리, 변수 미연결, 명도 대비, 터치 영역 44px, 기본 레이어 이름, 여백·격자, 빠진 상태, 화면 간 일관성, 금지 카피
- 사람 검사(`npm run review`): 위계, 주요 행동, 상태 안내, 기준 시각, 누름 단서, 톤 등 12항목
- Figma 쓰기는 디자인 시스템 승인 뒤, `work/<프로젝트>/figma.json`에 적힌 파일에만 (훅이 강제)

## 다른 프로젝트에서 쓰기 (플러그인)

이 저장소가 그대로 Claude Code 플러그인이자 마켓플레이스다(`.claude-plugin/`). 쓰려는 프로젝트 폴더에서:

```bash
claude plugin marketplace add /경로/design-harness        # 또는 git 저장소 주소
claude plugin install design-harness@design-harness --scope project
```
Claude Code에서 `/design-flow`(겹치는 이름이 있으면 `/design-harness:design-flow`)로 시작한다. `work/`가 없으면 프로젝트 이름을 묻고 `design-harness new <이름>`으로 PRD 틀을 만든다.

- 명령은 `design-harness <check|approve|lint:figma|wireframe|refs:capture|review|handoff|new|setup|path …>`. 플러그인이 켜져 있으면 PATH에 있다. 사람 승인은 프롬프트에서 `! design-harness approve system --by <이름>`.
- 산출물은 그 프로젝트의 `work/`, `out/`에 생긴다. 하네스 코드는 플러그인 폴더에 있다.
- 레퍼런스 캡처(playwright-core)는 git에서 설치하면 자동으로 깔린다. 로컬 경로로 설치했으면 `design-harness setup`을 한 번.
- 훅(figma-guard, Stop 게이트)은 `work/`가 없는 프로젝트에서는 아무것도 하지 않는다.
- 이 저장소 안에서는 플러그인을 켜지 않는다(`.claude/settings.json` 훅과 두 번 돈다). 바꾼 뒤 `npm run plugin:validate`.

예시 프로젝트 `work/ttareungyi`: 서울시 공공자전거 따릉이 실시간 대여정보(서울 열린데이터광장 OA-15493, 공공누리 제1유형) 기반.

MIT License
