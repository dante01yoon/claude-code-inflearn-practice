# 섹션 1 · 하네스 지도

클로드 코드가 모델(클로드)을 감싸는 **하네스**라는 점, 하네스를 이루는 여섯 칸(컨텍스트·도구·권한·검증·격리·자동화), 그리고 이 강의의 어느 섹션에서 각 칸을 채우는지 정리합니다.
실습: `start/`(역 5곳 승하차 표) → 부탁 두 개 → `solution/`(역별 시간대 그래프).
촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.296, auto 모드(기본), Opus 5.5 · medium, 2026-10-11

## 시작하기
```bash
cd start
git init && git add -A && git commit -m "시작: 역별 승하차 표"
claude
```

## 입력한 것 (그대로)
```text
이 폴더가 뭐 하는 프로젝트인지 알려 줘
역마다 시간대별 승하차를 그래프로 보여 줘
/context
```
짧은 프롬프트만으로 원하는 결과가 나와서, 자세한 버전은 쓰지 않았습니다.

화면에서 본 것
- 첫 부탁: 클로드가 파일 목록·README·데이터 모양을 읽고(살펴보기) 설명. 명령 아래 `Allowed by auto mode classifier` = 권한 칸이 검사하고 통과시킴.
- 둘째 부탁: `dataviz` 스킬을 불러오고(컨텍스트) → `index.html` 수정(도구) → 직접 서버를 띄워 스크린샷으로 확인(검증). 마우스 툴팁은 "직접 확인하지 못했다"고 보고 → 브라우저에서 직접 확인함.
- `/context`: 약 49.8k / 1m 토큰(5%) — 시스템 안내문 2.5k, 도구 22.9k, 스킬 2.6k, 메시지 21.7k.

결과 보기: `cd solution && python3 -m http.server 8000` → http://127.0.0.1:8000

## 핵심 정리 (공식 문서 확인)
| 항목 | 내용 | 근거 |
|---|---|---|
| 하네스 | "Claude Code is the harness; Claude is the model inside it." 파일 읽기·쓰기, 명령 실행, 권한 확인, 메모리 불러오기, 행동을 잇는 루프를 제공 | [glossary#agentic-harness](https://code.claude.com/docs/en/glossary) |
| 에이전트 루프 | 맥락 모으기(살펴보기) → 행동 → 결과 확인, 필요하면 반복. 사용자는 언제든 끼어들 수 있음 | [how-claude-code-works](https://code.claude.com/docs/en/how-claude-code-works) |
| 검증 | 클로드가 돌려 볼 수 있는 확인 방법(테스트·빌드·스크린샷)을 주라. 없으면 내가 확인하는 사람이 됨. 단계: 부탁에 적기 → `/goal` → Stop 훅 → 두 번째 의견 | [best-practices#give-claude-a-way-to-verify-its-work](https://code.claude.com/docs/en/best-practices) |
| 칸마다 손잡이 | 컨텍스트 `CLAUDE.md`·`/context`·`/memory` · 도구 `/mcp`·`/skills` · 권한 `/permissions`·Shift+Tab · 격리 `/sandbox`·`--worktree` · 자동화 `/hooks`·`claude -p` | [commands](https://code.claude.com/docs/en/commands) |

## 강의 지도 (여섯 칸을 채우는 곳)
컨텍스트·권한 → 섹션 1 · 도구 → 섹션 2, 6(MCP) · 검증 → 섹션 4(화면 확인), 11(검증 하네스) · 격리 → 섹션 1(샌드박스), 9(병렬) · 자동화 → 섹션 3(훅), 10(루틴) · 완성 → 섹션 11

## 데이터
`data/subway-hourly-202607.json` — 서울 열린데이터광장 「서울시 지하철 호선별 역별 시간대별 승하차 인원 정보」(CardSubwayTime) 2026년 7월분, 공개 `sample` 키로 받은 5행. 출처: 서울특별시, 공공누리 제1유형.

## 연습 과제
1. 같은 폴더에서 "이 그래프가 맞는지 확인할 방법을 먼저 정하고 확인까지 해 줘"라고 부탁해 보고, 클로드가 어떤 검증을 고르는지 보세요.
2. `/context`를 부탁 전·후에 한 번씩 보고 메시지 칸이 얼마나 늘었는지 적어 보세요.
