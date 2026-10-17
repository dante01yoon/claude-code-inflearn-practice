# 섹션 11 · 85강 관측 — /usage · /statusline · OpenTelemetry로 사용량·비용 보기

## 이번 수업에서 할 것
- 관측 창 세 가지: `/usage`(지금 세션의 자세한 명세서), 상태 표시줄(늘 보이는 계기판), OpenTelemetry(숫자를 밖으로 내보내 모아 보기).
- `/statusline`을 평소 말로 달고, OpenTelemetry 메트릭을 받아 토큰·비용을 보여 주는 작은 대시보드를 만든다. **이메일·조직 ID 같은 계정 정보는 저장·표시·출력하지 않는다.**

촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.296, 오토 모드, Opus 5.5, 2026-10-17. 앱 브랜치 `sec11-spec`(84강에서 이어짐). 녹화 화면의 요금제 사용량 막대·사용량 크레딧 홍보 줄은 가림.

## 공식 문서로 확인한 것
| 내용 | 근거 |
|---|---|
| `/usage`(별칭 `/cost`·`/stats`) Session 블록 = 세션 비용 추정·API 시간·코드 변경·모델별 토큰·프롬프트 캐시. **Max·Pro 구독자에게 세션 비용은 청구와 관련 없음**(구독에 포함). 같은 화면에 요금제 사용량 막대 | [비용 관리 · /usage 명령 사용](https://code.claude.com/docs/ko/costs#using-the-/usage-command) |
| OpenTelemetry 내보내기는 모든 설정에서 작동하고, 사용자별 토큰·비용을 거의 실시간으로 내 관측 스택에 보내는 유일한 방법 | 같은 페이지 · 조직의 비용 관리 |
| `/statusline <자연어>` → `~/.claude/`에 스크립트 생성·설정 수정. 스크립트는 stdin JSON(`cost.total_cost_usd`, `context_window.used_percentage`, `model.display_name` 등)을 받아 출력 | [상태 표시줄 사용자 정의](https://code.claude.com/docs/ko/statusline) |
| `CLAUDE_CODE_ENABLE_TELEMETRY=1`, `OTEL_METRICS_EXPORTER`(otlp·prometheus·console·none), `OTEL_EXPORTER_OTLP_PROTOCOL`(grpc·http/json·http/protobuf), `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_METRIC_EXPORT_INTERVAL`(기본 60000ms). 메트릭 `claude_code.cost.usage`(USD)·`claude_code.token.usage`(tokens)·`claude_code.session.count` 등 | [모니터링(OpenTelemetry)](https://code.claude.com/docs/ko/monitoring-usage) |
| 표준 속성: `session.id`(`OTEL_METRICS_INCLUDE_SESSION_ID`로 끔), `user.account_uuid`·`user.account_id`(`OTEL_METRICS_INCLUDE_ACCOUNT_UUID`), **`organization.id`·`user.email`은 끄는 변수 없이 가능하면 항상 포함** | 같은 페이지 · 표준 속성 |

녹화 전 확인: OTLP `http/json`을 로컬 수신기로 받아 보니 실제로 `user.email`·`organization.id`·`user.account_uuid` 속성이 실려 옴 → 콘솔 내보내기(console)는 화면에 계정 정보가 찍히므로 쓰지 않음.

## 입력한 것 (그대로)
```text
claude
테스트 돌려 줘
/usage                      ← Esc로 닫음
/statusline 모델 이름, 컨텍스트를 몇 % 썼는지 막대로, 이번 세션 비용을 보여 줘
역 찾기에서 초성 검색은 어떻게 돼? 짧게 설명해 줘
OpenTelemetry로 클로드 코드 사용량을 받아서 토큰이랑 비용을 보여 주는 작은 대시보드를 만들어 줘. tools/otel-view.mjs 하나로, OTLP http/json을 127.0.0.1:18972에서 받고 같은 주소에 화면을 띄워 줘. 이메일·조직·계정 ID 같은 계정 정보는 저장도 표시도 출력도 하지 마
커밋해 줘
/exit
node tools/otel-view.mjs > /tmp/otel-view.log 2>&1 &
export CLAUDE_CODE_ENABLE_TELEMETRY=1 OTEL_METRICS_EXPORTER=otlp OTEL_EXPORTER_OTLP_PROTOCOL=http/json OTEL_EXPORTER_OTLP_ENDPOINT=http://127.0.0.1:18972 OTEL_METRIC_EXPORT_INTERVAL=5000
claude -p "서울 라이브 3D의 테스트 파일은 몇 개야? 숫자만"
```

## 화면에서 본 것 (녹화 1회, 2026-10-17 04:12~04:18 EDT)
| 시점 | 본 것 |
|---|---|
| `/usage` (테스트 1회 뒤) | Total cost $0.2046 · API 16초 · claude-opus-5-5 512 input · 572 output · 122.8k cache read · 20.8k cache write · Prompt cache 3 requests · 81% of input tokens from cache. 요금제 막대는 가림 |
| `/statusline` | 내장 statusline-setup 에이전트가 17초 만에 `~/.claude/statusline-command.sh` + `settings.json`의 `statusLine` 추가. 표시 `Opus 5.5 \| ░░░░░░░░░░ 4% \| $0.37` → 질문 하나 뒤 `$0.42` |
| 대시보드 만들기 | 2분 23초. 속성 허용 목록 `KEEP_ATTRS = ["model", "type", "session.id"]`(리소스 속성은 읽지 않음), 메모리에만 보관, 이메일·ID를 넣은 가짜 데이터로 걸러지는지 보는 테스트(`tests/otel-view.test.mjs`), Host 헤더 검사. 커밋 `61ab224` |
| 대시보드(녹화 뒤 서버를 다시 켜고 `claude -p` 2번) | 비용 $0.1654 · 토큰 합계 119,758(입력 8 · 출력 228 · 캐시 읽기 101,969 · 캐시 쓰기 17,553), 모델별·세션별(세션 ID 앞 8자리)·최근 API 요청 4건. 이메일·조직 ID 없음 |

녹화 속 셸의 대시보드 서버는 녹화가 끝나며 code-server와 함께 꺼져서, 대시보드 화면은 같은 폴더에서 서버를 다시 켜고 `claude -p` 질문 2개를 보내 따로 녹화했습니다.

## 파일
- `solution/tools/otel-view.mjs`, `solution/tests/otel-view.test.mjs` — 대시보드(계정 정보 허용 목록으로 버림)
- `solution/statusline-command.sh` — `/statusline`이 만든 스크립트
- `solution/otel-env.sh` — 내보내기 환경 변수 예시

## 연습 과제
1. `OTEL_METRICS_INCLUDE_SESSION_ID=false`를 더하고 대시보드의 세션별 표가 어떻게 바뀌는지 보세요.
2. 상태 표시줄에 캐시 비율(`prompt_cache` 필드)을 더해 달라고 `/statusline`으로 부탁해 보세요.
