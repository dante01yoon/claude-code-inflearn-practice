# 섹션 8 · 66강 휴대폰에서 이어 하기 — Remote Control(`/remote-control`)

## 개념: 리모컨
일은 계속 **내 컴퓨터**의 claude가 하고(내 파일 · MCP 서버 · 설정 그대로), 휴대폰의 Claude 앱이나 다른 컴퓨터 브라우저의 claude.ai/code는 그 세션을 보고 조종하는 창입니다. 컴퓨터가 켜져 있고 claude가 돌고 있어야 합니다(클라우드 세션과 다른 점).
- 연결: 내 컴퓨터는 바깥으로 나가는 HTTPS만 보내고 들어오는 포트를 열지 않습니다. 메시지는 Anthropic API(TLS)를 거칩니다. 연결된 동안 대화 내용은 기기 동기화를 위해 Anthropic 서버에 저장되고, 실행과 파일 접근은 내 컴퓨터에만 있습니다.
- 요금제: Pro · Max · Team · Enterprise(API 키로는 안 됨, Team/Enterprise는 관리자가 켜야 함).

| 켜는 방법 | |
|---|---|
| `claude remote-control` | 서버 모드(기다리는 프로세스, Space로 QR) |
| `claude --remote-control "이름"` (`--rc`) | 처음부터 켜고 대화 시작 |
| `/remote-control 이름` (`/rc`) | 이미 대화 중인 세션에서 |

## 실습 (입력한 것 그대로)
```text
/remote-control 서울 라이브 3D
```
- 처음 한 번 확인 창: "Enable Remote Control — Opens a secure connection to claude.ai" / "Never mind".
- 켜지면 머리말에 `/rc`, "/remote-control is active · Continue here, on your phone, or at <세션 주소>".
```text
/remote-control        # 다시 치면 상태 창: Disconnect this session / Show QR code / Continue
```
- Show QR code → 터미널에 QR. 휴대폰 카메라로 찍으면 Claude 앱에서 이 세션이 열립니다. **세션 주소와 QR은 내 세션으로 들어가는 문이라 남에게 보이지 마세요**(영상에서도 가림).
- Disconnect this session → "Remote Control disconnected." 원격 연결만 끊기고 터미널 세션은 그대로.

## 휴대폰 · 브라우저에서
- 됨: 메시지, 사진 · 파일 첨부, 서브에이전트 · 워크플로 진행 보기, `/model` `/effort` `/compact` `/usage` 등(인자와 함께).
- 컴퓨터에서만: `/plugin`, `/resume`처럼 터미널 화면이 필요한 명령.
- 푸시 알림: `/config`에서 "Push when Claude decides" / "Push when actions required"(Claude 앱 로그인 필요).
- `/goal`과 함께: 조건을 적어 맡기고 Remote Control을 켜 두면 밖에서 진행을 보다가 필요할 때만 답하면 됩니다.

## 근거 (2026-10-12 확인, Claude Code 2.1.296)
- [Continue local sessions from any device with Remote Control](https://code.claude.com/docs/en/remote-control)

※ 이 수업의 휴대폰 화면은 그림(클레이)이며, 실제 녹화는 터미널 쪽(켜기 · 상태 창 · QR · 연결 끊기)입니다.
