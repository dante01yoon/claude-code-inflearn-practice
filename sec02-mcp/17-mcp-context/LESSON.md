# 섹션 2 · 17강 도구가 많아질 때 컨텍스트 관리 — 안 쓰는 서버 끄기

컨텍스트 = 클로드의 책상 크기. MCP 서버를 꽂을 때마다 도구 설명서가 늘어나지만, 지금의 클로드 코드는 **도구 검색(tool search)** 으로 설명서를 필요할 때만 꺼내 옵니다. 직접 재 보고, 안 쓰는 서버를 꺼 봅니다.

## 이번 수업에서 입력한 것 (그대로)

시작 폴더: `start/` (16강 끝 상태 + `mcp_context_check.py`). `.mcp.json`에는 context7 · playwright와 함께, **연결에 실패하는 서버가 어떻게 보이는지 보려고 일부러 넣은 토큰 없는 github 서버**가 있습니다(16강에서 깃허브는 MCP 대신 `gh`를 씁니다). 실습 뒤에는 `claude mcp remove github --scope project`로 지워도 됩니다.

```bash
python3 mcp_context_check.py     # claude -p /context를 세 가지 설정으로 실행해 표로
claude
```

```text
/context         # MCP tools · /mcp (loaded on-demand) └ 27 tools · 0 tokens
/mcp             # ↓↓ playwright → Enter → 3. Disable → Esc
/context         # └ 2 tools · 0 tokens
/exit
```

```bash
claude mcp list  # playwright: … - ⊘ Disabled for this project (re-enable via /mcp)
```

## 📏 직접 재 본 결과 (2026-10-11, Claude Code v2.1.296, Opus 5.5 · 1M 컨텍스트, github는 토큰이 없어 연결 실패 → 연결된 서버 2개)

| 설정 | 시작 토큰 | MCP 도구 · 바로 올림 | MCP 도구 · 필요할 때 |
|---|---:|---:|---:|
| MCP 끔 (`--strict-mcp-config`) | 12,400 | 0 | 0 |
| MCP 켬 · 기본(도구 검색) | 12,600 | 0 | 8,200 |
| MCP 켬 · 도구 검색 끔 (`ENABLE_TOOL_SEARCH=false`) | 37,300 | 8,200 | 0 |

- 도구 검색을 끄면 클로드 코드 자체 도구 설명도 처음부터 올라가서 전체가 더 크게 늘어납니다(MCP 몫은 8,200).
- 숫자는 계정·설치된 스킬·버전에 따라 달라집니다. 내 폴더에서 `python3 mcp_context_check.py`로 직접 재 보세요.

## 핵심 정리 (공식 문서 확인)

| 항목 | 내용 | 근거 |
|---|---|---|
| 도구 검색 | 기본으로 켜짐. 시작할 때는 도구 이름·서버 안내문만, 정의는 필요할 때. `ANTHROPIC_BASE_URL`이 다른 주소면 꺼짐. `ENABLE_TOOL_SEARCH`로 조절(`true`/`auto`/`auto:N`/`false`) | [Scale with MCP tool search](https://code.claude.com/docs/en/mcp#scale-with-mcp-tool-search) |
| 도구 결과 | 결과가 1만 토큰을 넘으면 경고, 기본 한도 2만 5천 토큰(`MAX_MCP_OUTPUT_TOKENS`로 변경) | [MCP output limits](https://code.claude.com/docs/en/mcp#mcp-output-limits-and-warnings) |
| 서버 끄기 | `/mcp`에서 서버 → Disable. 설정은 남고 연결만 멈춤. 프로젝트별로 `~/.claude.json`의 `disabledMcpServers`에 기록 | [Disable a server without removing it](https://code.claude.com/docs/en/mcp#disable-a-server-without-removing-it) |
| 다시 켜기 | `/mcp`의 같은 메뉴 | 같은 문서 |
| 완전히 지우기 | `claude mcp remove <이름>` | [mcp](https://code.claude.com/docs/en/mcp#managing-your-servers) |

## 연습 과제
1. 내 폴더에서 `python3 mcp_context_check.py`를 실행해 세 숫자 확인
2. `/mcp`에서 서버 하나를 끄고 `/context`의 MCP 도구 개수가 줄어드는지 확인 (확인 뒤 다시 켜기)
