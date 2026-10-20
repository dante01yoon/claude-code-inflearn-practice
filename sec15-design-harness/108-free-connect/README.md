# 공식 MCP 없이 무료로 피그마 연결 (Talk to Figma)

클로드 코드가 피그마 데스크톱 앱에 직접 그리도록 연결합니다. 피그마 공식 MCP 서버는 Starter(무료) 요금제에서 호출 수 한도가 작아서
([공식 문서: Rate limits](https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/)), 이 섹션은 오픈소스 플러그인
**Talk to Figma**([grab/cursor-talk-to-figma-mcp](https://github.com/grab/cursor-talk-to-figma-mcp), MIT)를 이 컴퓨터 안에서만 씁니다.

```
클로드 코드 ──(node tff.mjs)──▶ 중계 서버 127.0.0.1:3055 ──(채널)──▶ 피그마 플러그인 ──▶ 열린 피그마 파일
```

## 준비물
- 피그마 **데스크톱 앱** (https://www.figma.com/downloads/) — 개발 중인 플러그인은 데스크톱 앱에서만 불러올 수 있습니다.
- Node.js 20 이상, git

## 순서
```bash
# 1. 원본 받기 (어느 폴더든 괜찮습니다. 수업에서는 /Users/Shared)
git clone https://github.com/grab/cursor-talk-to-figma-mcp.git talk-to-figma
cd talk-to-figma

# 2. 이 폴더의 작은 변경 적용 (아래 '바꾼 것')
git apply <이 폴더>/local-changes/local-changes.patch
cp <이 폴더>/local-changes/*.mjs .

# 3. 중계 서버 (이 창은 켜 둡니다)
npm install ws
node relay.mjs          # relay listening on 127.0.0.1:3055
```
4. 피그마 데스크톱 → 왼쪽 위 메뉴 → **Plugins → Development → Import plugin from manifest…** → `talk-to-figma/src/cursor_mcp_plugin/manifest.json`
5. 메뉴 → **Plugins → Development → Cursor MCP Plugin** 실행 → `Connected to server in channel: xxxxxxxx` 의 채널 이름 확인
6. 새 터미널에서 `claude` 실행 후 프롬프트(아래 PROMPTS.md)

## 바꾼 것 (local-changes)
| 파일 | 변경 | 이유 |
|---|---|---|
| `src/cursor_mcp_plugin/code.js` | `run_script` 명령 추가: 보낸 Plugin API 코드를 플러그인 안에서 실행 | 정해진 명령 수십 개 대신 코드 한 번으로 변수·컴포넌트·화면을 만들기 위해 |
| `src/cursor_mcp_plugin/ui.html` | 사용 기록(Google Analytics) 전송 끔 | 작업 내용이 밖으로 나가지 않게 |
| `src/cursor_mcp_plugin/manifest.json` | 허용 주소에서 GA 도메인 제거, `ws://localhost:3055`만 | 위와 같음 |
| `relay.mjs` (새 파일) | 원본 `src/socket.ts`(Bun)를 Node로 옮김, **127.0.0.1에만** 열림 | Bun 설치 없이, 같은 와이파이의 다른 기기에서 접속 못 하게 |
| `tff.mjs` (새 파일) | 채널로 명령 하나를 보내고 결과를 출력하는 작은 클라이언트 `node tff.mjs <채널> <명령> [params.json\|-]` | MCP 설정 없이 터미널·클로드 코드에서 바로 |

원본 저작권·라이선스(MIT, `LICENSE`)는 그대로 둡니다. `relay.mjs`는 원본 `src/socket.ts`를 옮긴 것이라 같은 MIT 조건을 따릅니다.

## 자주 나는 오류
| 증상 | 원인 | 해결 |
|---|---|---|
| Plugins 메뉴에 Development가 없음 / 가져오기 실패 | 브라우저에서 피그마를 열었음 | 데스크톱 앱에서 |
| 플러그인 창에 연결 안 됨 | 중계 서버를 안 켬 | `node relay.mjs` 창을 켜 둠 |
| `EADDRINUSE 127.0.0.1:3055` | 중계 서버가 이미 켜져 있음 | 이미 켜진 것을 그대로 쓰거나 끄고 다시 |
| `tff.mjs`가 `timeout` | 채널 이름이 다르거나 플러그인을 닫았음 | 플러그인 창의 채널 이름을 다시 확인(플러그인을 다시 켜면 바뀜) |
| `Cannot find package 'ws'` | `npm install ws`를 안 함 | 그 폴더에서 `npm install ws` |
