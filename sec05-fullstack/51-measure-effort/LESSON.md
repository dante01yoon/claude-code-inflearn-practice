# 섹션 5 · 51강 📏 직접 재 보기: effort 단계별 시간과 품질

## 방법
- 일 하나 고정: `measure/prompt.txt`(붐빔 기록 배열 → summarize(rows)), 연습 폴더 `measure/fixture`(실제 수집 기록 6행).
- 품질: 클로드가 못 보는 숨은 테스트 10개(`measure/grader/grade.test.mjs`).
- `claude -p --model sonnet --effort <단계> --output-format json --permission-mode acceptEdits`, 단계마다 새 폴더 × 2번 = 10번. 시간 = 실제 걸린 시간, 비용 = `total_cost_usd`.

```bash
cd measure && python3 measure_effort.py 2    # 결과: results.json, runs/<단계>-<회차>/
```

## 결과 (Sonnet 5.5, 2026-10-12, 단계마다 2번 평균)
| effort | 시간(초) | 비용($) | 숨은 테스트 | 자체 테스트 파일 | 주고받은 횟수 |
|---|---|---|---|---|---|
| low | 16.1 | 0.074 | 10/10 | 0 | 6 |
| medium | 17.4 | 0.074 | 10/10 | 0 | 5 |
| high | 32.1 | 0.108 | 10/10 | 1 | 6.5 |
| xhigh | 46.6 | 0.137 | 10/10 | 1 | 7 |
| max | 358.7 | 0.818 | 10/10 | 0.5 | 26.5 |

- 조건이 분명한 작은 일에서는 품질 차이 없음. high부터 스스로 테스트 파일을 만들어 검증. max는 시간 22배·비용 11배(문서의 overthinking 경고와 일치).
- 작은 일 하나·단계마다 2번의 결과입니다. 내 일로 다시 재 보세요.

## 근거
- [Claude Code Model configuration · Choose an effort level](https://code.claude.com/docs/en/model-config)

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 5 = 브랜치 `sec05-crowd`, main 병합 `9e43764`). 측정 도구와 결과는 `measure/`에 있습니다.
