# 섹션 2 · 16강 꼭 쓰는 MCP — Context7(문서) · Playwright(브라우저) · 깃허브는 MCP 대신 `gh` · 🆕 `claude mcp login`

결과: 서울 라이브 3D 폴더에 **역마다 3D 기둥이 서는 지도 페이지 `map.html`** (deck.gl ColumnLayer + MapLibre 기본 지도)와 Playwright가 찍은 스크린샷.

## 이번 수업에서 입력한 것 (그대로)

시작 폴더: `start/` (15강과 같은 서울 라이브 3D 폴더, MCP 설정 없음)

```bash
claude mcp add --scope project --transport http context7 https://mcp.context7.com/mcp
claude                     # 승인 화면 → "Use this and all future MCP servers in this project"
```

클로드에게 (짧은 프롬프트 한 번으로 됨):

```text
context7로 deck.gl 문서 찾아보고, data 폴더 지하철 데이터로 역마다 3D 기둥이 서는 지도 페이지 만들어 줘
```

```bash
/exit
claude mcp add --scope project playwright -- npx -y @playwright/mcp@latest --headless --isolated
cat .mcp.json
claude --continue
```

```text
playwright로 방금 만든 페이지 열어서 스크린샷 찍어 줘
```

깃허브는 MCP 서버 없이 `gh` 명령으로 (gh를 설치하고 `gh auth login`으로 한 번 로그인해 둔 상태):

```bash
claude
```

```text
dante01yoon/claude-code-inflearn-practice 저장소 최근 커밋이랑 PR, 이슈 보여 줘
```

→ 클로드가 `gh api repos/…/commits`, `gh pr list`, 이슈 조회 같은 **읽기 전용** gh 명령을 직접 실행. 결과: 최근 커밋 7개 표, PR·이슈는 아직 없음.

왜 MCP를 안 쓰나: 깃허브처럼 좋은 CLI가 있는 서비스는 클로드 코드가 그 명령을 바로 쓰는 편이 더 간단하고(설정·토큰 전달 없음) 도구 설명서가 컨텍스트를 차지하지도 않습니다. MCP는 CLI가 없거나, 최신 문서 검색·브라우저 조작처럼 명령어로 하기 어려운 일에 씁니다.

OAuth 서버 로그인 (영상에서는 주소가 나온 뒤 Ctrl+C로 취소):

```bash
claude mcp add --transport http notion https://mcp.notion.com/mcp
claude mcp login notion --no-browser   # 주소를 브라우저에서 열고 승인 → (브라우저가 없으면) 돌아온 주소를 붙여 넣기
claude mcp remove notion               # 지우면 저장된 로그인 정보도 함께 삭제
```

## 핵심 정리 (공식 문서·저장소 확인, Claude Code v2.1.296)

| 항목 | 내용 | 근거 |
|---|---|---|
| Context7 | Upstash가 만든 최신 라이브러리 문서 MCP. 원격 주소 `https://mcp.context7.com/mcp`, API 키는 선택(무료 키 = 더 높은 한도). 도구 `resolve-library-id`, `query-docs` | [upstash/context7](https://github.com/upstash/context7) |
| Playwright MCP | 마이크로소프트. 접근성 트리로 페이지를 읽어 조작("not pixel-based"). `--headless`(창 없이), `--isolated`(프로필을 메모리에만) | [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) |
| 깃허브 | 공식 MCP 서버도 있지만(토큰 필요) 이 강의는 `gh` CLI로. 클로드 코드는 셸 명령을 직접 실행 | [GitHub CLI](https://cli.github.com/), [github/github-mcp-server](https://github.com/github/github-mcp-server) |
| 🆕 `claude mcp login <이름>` | OAuth 서버를 `/mcp` 없이 셸에서 로그인. `--no-browser`는 주소만 출력. v2.1.186(2026-06-22) 추가 | [mcp 문서](https://code.claude.com/docs/en/mcp#authenticate-from-the-command-line), changelog |
| 승인 기록 | "Use this and all future…"를 고르면 `.claude/settings.local.json`에 `enableAllProjectMcpServers: true` | 녹화 결과 파일 |

## 화면에서 확인한 것
- Context7 검색어: `ColumnLayer 3D columns on map with MapLibre basemap standalone script` 등 2회
- 첫 부탁에서 클로드가 MCP 없이 스스로 헤드리스 Chrome으로 확인(약 2분) → Playwright MCP로는 46초
- 결과 파일: `solution/map.html`, `solution/data/stations.json`(역 좌표는 데이터에 없어 **근사값**), `solution/.playwright-mcp/map-screenshot.png`
- 데이터: 서울 열린데이터광장 「지하철 호선별 역별 시간대별 승하차 인원」 2026년 7월 (공공누리 제1유형)
- 보기: `solution/`에서 `python3 -m http.server 8000` → http://127.0.0.1:8000/map.html (`file://`로는 fetch가 막힘)

## 연습 과제
Context7·Playwright를 project 범위로 추가하고, 관심 있는 라이브러리 하나로 작은 페이지를 만든 뒤 Playwright 스크린샷으로 확인하기.
