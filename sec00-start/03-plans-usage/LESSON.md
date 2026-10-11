# 섹션 0 · 3강 요금제·사용량 감 잡기 — Pro와 Max, `/usage`로 무엇이 한도를 쓰는지

## 이번 수업에서 입력한 것 (그대로)

```text
ls
claude
/usage            # 사용량 화면 (영상에서는 개인 한도 정보라 가림)
/context          # 지금 대화가 차지하는 토큰
/exit
python3 usage_check.py
```

## 핵심 정리 (공식 문서 확인, 2026-10-11)

| 항목 | 내용 | 근거 |
|---|---|---|
| 필요한 요금제 | Pro, Max, Team, Enterprise 또는 Console(API) 계정. 무료 플랜에는 클로드 코드가 없음 | [setup#authenticate](https://code.claude.com/docs/en/setup#authenticate) |
| Pro | 월 결제 $20 (연 결제 시 월 $17), Claude Code 포함 | [claude.com/pricing](https://claude.com/pricing) |
| Max | $100부터, Pro보다 5배 또는 20배 사용량, Claude Code 포함 | claude.com/pricing |
| `/usage` | 위: 이번 세션 토큰·추정 비용(API 사용자용). 구독자는 요금제 사용량 막대, 무엇이 한도를 썼는지(긴 대화·서브에이전트·MCP 등), 사용량 크레딧 | [costs#using-the-usage-command](https://code.claude.com/docs/en/costs) |
| 긴 세션이 많이 쓰는 이유 | 요청마다 지금까지의 대화 전체를 함께 보냄. 도구 결과(읽은 파일 등)도 대화에 쌓임 | [costs#why-usage-climbs-in-a-long-session](https://code.claude.com/docs/en/costs) |
| 아끼는 법 | 일이 바뀌면 `/clear`, 필요한 파일만 가리키기, 구체적으로 부탁하기, 쉬운 일엔 가벼운 모델·낮은 생각 깊이 | [costs#reduce-token-usage](https://code.claude.com/docs/en/costs) |

요금은 녹화 시점(2026-10-11) 공식 페이지 기준이며 바뀔 수 있습니다. 개인의 한도·사용량 화면은 영상에서 가렸습니다.

## 📏 직접 재 보기 — usage_check.py

같은 폴더에서 세 가지 부탁을 `claude -p --safe-mode --output-format json`으로 3번씩(모두 9번 동시에) 실행하고, 결과 JSON의 `modelUsage`(입력·캐시·출력 토큰)와 `total_cost_usd`(공식 단가 추정치, 구독 청구액 아님)를 평균 냅니다.

- A 짧은 질문: `안녕하세요 한 문장으로만 답해 줘.`
- B 파일 통째로 읽기: `big-log.txt를 처음부터 끝까지 전부 읽고, 어떤 일이 있었는지 세 줄로 요약해 줘.`
- C 필요한 줄만 찾기: `big-log.txt에서 ERROR가 들어간 줄이 몇 개인지만 세어서 숫자로 알려 줘.`

결과는 `solution/usage_results.json` (표는 녹화 후 채움).
