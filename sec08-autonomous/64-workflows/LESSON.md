# 섹션 8 · 64강 dynamic workflows(`/workflows`)와 `ultracode` — 큰 작업을 서브에이전트 여럿으로

## 개념: 작업반장의 설계도
dynamic workflow = 클로드가 쓴 **자바스크립트 스크립트**가 서브에이전트 여럿을 조율하고, 런타임이 그 스크립트를 백그라운드에서 실행합니다. 중간 결과는 스크립트 변수에 있고 내 대화창에는 최종 결과만 옵니다.

| | 누가 다음 할 일을 정하나 | 중간 결과 | 규모 |
|---|---|---|---|
| 서브에이전트 | 클로드가 한 턴씩 | 내 대화창 | 한 턴에 몇 개 |
| agent teams (실험) | 리더 에이전트 | 공유 작업 목록 | 동료 몇 명 |
| dynamic workflows | 스크립트 | 스크립트 변수 | 수십~수백 개 |

- 부르기: 프롬프트에 `ultracode` 낱말(또는 "워크플로로 해 줘") → 그 일 하나만. `/effort ultracode`(또는 `claude --effort ultracode`, 설정 `"ultracode": true`)는 effort 레벨이 아닌 **별도 설정**으로, 세션의 큰 일마다 클로드가 알아서 워크플로를 짭니다(토큰을 훨씬 많이 씀). 끄기 `/effort ultracode off`.
- 실행 전 확인 창(단계 목록 · 토큰 경고 · Yes, run it / View raw script / No). auto 모드는 첫 실행만 묻습니다.
- `/workflows`: 단계·에이전트 진행, Enter로 들어가기, `p` 멈춤, `x` 중지, `s` 스크립트를 명령으로 저장(`.claude/workflows/` 또는 `~/.claude/workflows/`). 묶음 워크플로 `/deep-research`.
- 한도: 동시 에이전트 기본 16개, 한 번 실행 최대 1,000개. 모든 유료 요금제(Pro는 /config에서 켜기).

## 실습 (입력한 것 그대로)
```text
ultracode: 인증키가 브라우저나 응답, 오류 문구로 새는 곳이 있는지 서버 쪽 파일마다 점검해 줘
/workflows
```
- 클로드가 서버 쪽 파일을 7개 묶음으로 나눠 **Audit 7 → Verify 22 → Critic 1**, 모두 30개 에이전트(2분 49초). 진행 줄 기준 약 **92만 토큰**.
- 보고: 문제 후보 22건 → 반박 검증 뒤 실제 누출 1건(low) — 서울 열린데이터 API 키가 암호화되지 않은 http 요청 주소에 들어감(`realtime-trains.mjs`, `realtime-citydata.mjs`, `mcp-server/src/openapi.ts`). 브라우저·응답으로는 나가지 않음. 정적 파일 우회 요청(/.env, %2e 등)·오류 문구·로그·배포물·git 기록은 직접 실행해 보고 안전 확인. 코드는 고치지 않음.
- 참고: 서울 열린데이터광장 sample 주소를 https로 부르면 연결되지 않았습니다(2026-10-12). 키를 주기적으로 새로 발급하는 것이 현실적인 대응입니다.

## 주의
워크플로는 서브에이전트를 동시에 여럿 돌리므로 구독 사용량을 빨리 씁니다. 작은 일에는 쓰지 말고, 필요한 일에만 `ultracode` 낱말로 부르세요.

## 근거 (2026-10-12 확인, Claude Code 2.1.296)
- [Orchestrate subagents at scale with dynamic workflows](https://code.claude.com/docs/en/workflows)
- [Model configuration — ultracode](https://code.claude.com/docs/en/model-config)

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 8 = 브랜치 `sec08-auto`, 이 수업은 점검만 하고 코드 변경 없음).
