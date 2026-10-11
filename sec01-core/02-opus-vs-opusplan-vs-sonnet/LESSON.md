# 섹션 1 · 📏 Opus만 vs opusplan vs Sonnet만 (파일럿 P2)

영상: `output/p2-final.mp4` · 실습 폴더: `practice/start/` → `practice/solution/`(3회 실측 결과·결과 페이지 9개 포함)

## 입력한 것 (그대로)
`prompt.txt` (VS Code 편집기에 직접 입력):
```text
지출을 적으면 카테고리별 도넛 차트로 보여 주는 가계부 웹 페이지를 index.html 한 파일로 만들어 줘. 새로고침해도 기록이 남게 해 줘.
```
터미널: `python3 measure.py` (화면 녹화 = 1회차) → 녹화 밖에서 `python3 measure.py --start 2 --reps 2` (2·3회차)
결과 보기: `python3 -m http.server 8000` → `http://127.0.0.1:8000/compare.html?rep=1`

## 측정 방법 (세 갈래 동일)
1. 계획: `claude -p "<prompt.txt>" --model <opus|opusplan|sonnet> --permission-mode plan --safe-mode --output-format json`
2. 구현: `claude -p "계획대로 만들어 줘" --resume <session_id> --model <같은 값> --permission-mode acceptEdits --safe-mode --output-format json`
- 시간 = 두 단계 벽시계 합. 토큰·비용 = 구현 단계 결과 JSON의 세션 누적 `modelUsage`·`total_cost_usd` ([agent-sdk/cost-tracking](https://code.claude.com/docs/en/agent-sdk/cost-tracking): resume 호출은 이전 지출 포함).
- `total_cost_usd`는 Claude Code가 단가표로 계산한 추정치. 구독 요금제 실제 청구액 아님.
- effort 기본값(medium), `--safe-mode`(CLAUDE.md·스킬·플러그인·MCP 미적용), 세 갈래 동시 실행.
- opusplan 계획 단계가 Opus 5.5로 돌았는지는 계획 단계 JSON `modelUsage` 키로 확인(세 회차 모두 `claude-opus-5-5`), 구현 단계는 `claude-sonnet-5-5` 추가.

## 결과 (회차별, `practice/solution/results.json`)
| 설정 | 1회차(녹화) | 2회차 | 3회차 | 평균 |
|---|---|---|---|---|
| Opus만 시간 / 비용 | 103.5초 / $0.423 | 90.7초 / $0.341 | 114.7초 / $0.439 | 103.0초 / $0.401 |
| opusplan | 74.3초 / $0.358 | 76.3초 / $0.292 | 73.5초 / $0.254 | 74.7초 / $0.301 |
| Sonnet만 | 75.2초 / $0.222 | 51.8초 / $0.136 | 75.3초 / $0.219 | 67.4초 / $0.193 |

평균 출력 토큰: Opus만 10,764 · opusplan 9,115 · Sonnet만 9,392. 평균 전체 토큰(입력+캐시+출력): 239,866 · 239,896 · 212,589.
opusplan 내부 평균: Opus 계획 2,412 출력 토큰 / $0.148, Sonnet 구현 6,703 / $0.153.
사전 시험 1회(녹화 전, `pretest-91/`, 표에서 제외): Opus만 134.9초/$0.568, opusplan 74.6초/$0.250, Sonnet만 64.3초/$0.159 — 같은 순서.

## 작동 확인 (capture/compare_rec.mjs)
세 페이지에 지출 4건(12000·3500·45000·8000) 입력 → 새로고침 → 금액 4개가 남는지·차트 요소 확인.
- 1·2회차: 셋 다 통과. 3회차: opusplan·Sonnet만 통과, **Opus만 실패**(새로고침 후 카테고리가 모두 '기타', 내역 표가 빔 — 따로 열어 재현함. 원인 코드 분석은 안 함).

## 결론
작은 단일 페이지에서는 Sonnet만이 가장 빠르고 저렴했고 기능도 충분. opusplan은 Opus만보다 시간·비용 약 25% 절감. 큰 작업은 직접 재 보기.

## 공식 문서
- https://code.claude.com/docs/en/model-config (opusplan, effort)
- https://code.claude.com/docs/en/headless · https://code.claude.com/docs/en/cli-reference (`-p`, `--output-format json`, `--resume`, `--permission-mode`, `--safe-mode`)
- https://code.claude.com/docs/en/agent-sdk/cost-tracking (total_cost_usd·modelUsage 의미)
