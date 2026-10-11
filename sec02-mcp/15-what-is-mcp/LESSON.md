# 섹션 2 · 15강 MCP란 — 연결 구조와 범위(local · project · user)

MCP(Model Context Protocol)는 클로드 코드를 바깥 도구·서비스에 연결하는 오픈 표준입니다. 이 강의에서는 **클로드 코드에 꽂는 만능 USB 허브**로 비유합니다. 서버(장치)를 꽂을 때마다 클로드가 쓸 수 있는 도구가 늘어납니다.

## 이번 수업에서 입력한 것 (그대로)

실습 폴더: `start/` (섹션 1의 서울 라이브 3D 폴더)를 VS Code로 열고 내장 터미널에서 실행했습니다.

```bash
claude mcp list                                   # → No MCP servers configured.
claude mcp add --transport http claude-code-docs https://code.claude.com/docs/mcp   # local 범위(기본값)
claude mcp get claude-code-docs                   # → Scope: Local config · Status: ✔ Connected
claude
```

클로드에게:

```text
claude-code-docs 서버로 MCP 서버 범위가 어떤 게 있는지 찾아서 짧게 알려 줘
```

```text
/mcp        # Local MCPs 아래 claude-code-docs · 3 tools
/exit
```

project 범위로 옮기기:

```bash
claude mcp remove claude-code-docs
claude mcp add --scope project --transport http claude-code-docs https://code.claude.com/docs/mcp
cat .mcp.json
claude mcp list                                   # → ⏸ Pending approval (run `claude` to approve)
claude                                            # → New MCP server found in this project → "Use this MCP server"
/mcp                                              # → Project MCPs (.mcp.json)
```

## 핵심 정리 (공식 문서 확인, Claude Code v2.1.296)

| 항목 | 내용 | 근거 |
|---|---|---|
| MCP | AI 앱을 바깥 시스템에 연결하는 오픈 소스 표준. 공식 사이트 비유는 "AI 앱을 위한 USB-C 포트". 2024-11-25 앤트로픽 공개 | [MCP 소개](https://modelcontextprotocol.io/introduction), [발표](https://www.anthropic.com/news/model-context-protocol) |
| 원격 서버 | `claude mcp add --transport http <이름> <주소>` | [mcp](https://code.claude.com/docs/en/mcp#option-1-add-a-remote-http-server) |
| 로컬 서버 | `claude mcp add <이름> -- <실행 명령>` (stdio). `--` 뒤는 서버 실행 명령 그대로 | [mcp](https://code.claude.com/docs/en/mcp#option-3-add-a-local-stdio-server) |
| local 범위 (기본값) | 이 프로젝트에서 나만. `~/.claude.json`의 해당 프로젝트 항목에 저장 | [MCP installation scopes](https://code.claude.com/docs/en/mcp#mcp-installation-scopes) |
| project 범위 | 프로젝트 폴더의 `.mcp.json`. 저장소에 올리면 팀 전체가 같은 서버. 대화형 세션은 처음 쓰기 전에 승인을 물음 | 같은 문서 |
| user 범위 | 나만, 내 모든 프로젝트. `~/.claude.json` 맨 위 `mcpServers` | 같은 문서 |
| 우선순위 | 같은 이름이면 local → project → user (→ 플러그인 → claude.ai 커넥터) 순서로 하나만 | 같은 문서 |
| 연습용 첫 서버 | `https://code.claude.com/docs/mcp` (클로드 코드 문서 검색, 로그인 없음) | [MCP quickstart](https://code.claude.com/docs/en/mcp-quickstart) |
| 안전 | 믿을 수 있는 서버만. 바깥 내용을 가져오는 서버는 프롬프트 인젝션 위험 | [mcp](https://code.claude.com/docs/en/mcp#find-and-build-mcp-servers) |

## 화면에서 확인한 것
- `claude mcp add` 결과: `Added HTTP MCP server claude-code-docs with URL: … to local config` + `File modified: <홈 폴더>/.claude.json [project: <폴더>]`
- 승인 화면 선택지: `Use this MCP server` / `Use this and all future MCP servers in this project` / `Continue without using this MCP server` — **처음 커서가 "쓰지 않기"에 있습니다.** 화살표로 고른 뒤 Enter.
- 정답 상태: `solution/.mcp.json`

## 연습 과제
1. 내 연습 폴더에서 `claude-code-docs`를 local로 추가하고, 궁금한 기능 하나를 물어보기
2. `--scope project`로 옮겨서 `.mcp.json`이 생기는지, `claude` 실행 때 승인 질문이 뜨는지 확인

정답 예시: 위 "입력한 것"과 같습니다. 질문 예: `claude-code-docs 서버로 /rewind가 뭔지 찾아 줘`
