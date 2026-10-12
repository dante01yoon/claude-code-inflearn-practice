# 섹션 4 · 38강 화면 검증 — Playwright로 스크린샷과 동작 확인

테스트는 계산을, Playwright는 사람이 보는 화면을 검사합니다. 보이는 모습 · 동작 · 콘솔 세 가지.

## 입력한 것 (그대로)
```bash
claude mcp add playwright --scope project -- npx @playwright/mcp@latest --headless --isolated
cat .mcp.json
CLAUDE_CODE_ENABLE_TODO_TOOLS=1 claude   # "New MCP server found" → Use this MCP server
```
```text
playwright로 subway.html 열어서 넓은 화면이랑 375px 스크린샷 찍고, 역 검색이랑 재생이 제대로 되는지 확인해 줘
```
→ 검색(가산·잠실·ddp·없는 이름·Enter)과 재생(0.9초마다, 03시→04시 순환) 정상. 스크린샷 `.playwright-mcp/`(wide-initial, wide-gasan-08, mobile-375-full). 눈여겨볼 점 3가지: ① 역을 골라도 시점이 도심에 머물러 기둥이 화면 끝 ② 375px에서 범례가 지도를 절반 가림 ③ 콘솔 경고: 서해선 시우역 열차가 노선 순서에 없어 빠짐.
```text
문제 있던 건 고치고 커밋해 줘
```
→ 역 선택 시 "선택 역 주변" 시점 이동, 좁은 화면 범례를 지도 아래로, 다시 확인하다 새로 발견한 375px 시간 눈금 겹침 수정, 서해선 경로 확장(시우역은 역사마스터에 없어 좌표를 짐작하지 않고 "N대 뺌" 표시), favicon 404 제거, `.playwright-mcp/`를 `.gitignore`에. 테스트 40개 통과. 커밋 `838e259`.

## 결과
- 고치기 전/후 스크린샷: 가산디지털단지 선택 시 기둥이 화면 가운데로
