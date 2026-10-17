---
paths:
  - "daily-report.mjs"
  - "realtime-bikes.mjs"
  - "scripts/daily-report.mjs"
  - "reports/**"
  - "tests/daily-report.test.mjs"
---

# 아침 리포트

`scripts/daily-report.mjs`(`npm run report`, `-- --no-claude`면 요약 없이)의 흐름:

1. 도시데이터(`createCitydataSource`, 캐시 0)와 따릉이 현황(`realtime-bikes.mjs`의 `createBikeSource`, bikeList)을 받는다.
2. `daily-report.mjs`가 만든다:
   - `reportFacts`: 단계별 수·분류별·붐비는/여유로운 곳·12시간 안에 오를 곳, 대여소 합계·빈 곳·거치율 높은 곳. 장소별 단계 `all`은 비교용이라 프롬프트에서 뺀다.
   - `reportDiff`: 그 날짜 전 가장 최근 리포트(`previousDate`)와 단계별 수·장소별 단계 변화·따릉이 합계 비교. 리포트의 `diff`이고, 요약의 `changes`도 이것으로 쓴다.
   - `visit`: `VISIT_PLACE` 광화문·덕수궁의 지금 값과 오늘(KST) 안의 12시간 예측, 시각은 `HH:MM`. 추천 후보 `candidates`는 그중 낮 시간 `VISIT_HOURS`(10:00~18:00, 양 끝 포함) 안의 시각. 요약의 `visit.best`는 claude가 후보 중에서 고르고(까닭에 단계·추정 인구를 그대로, 후보가 없으면 「아직 예측 없음」), 후보 밖 시각은 `checkVisitBest`가 버린다.
3. `claude -p --output-format json --json-schema REPORT_SCHEMA --tools ""`(임시 폴더에서, `.env`를 읽기 전 환경만 넘김)의 `structured_output`을 요약으로 쓴다.
4. `reports/YYYY-MM-DD.json`(KST)과 `reports/index.json`(`upsertIndex`)에 저장한다. 요약이 실패해도 숫자는 저장하고 종료 코드 1.

- 보기는 `reports/index.html`. 시각 칸에 「추천」 표시, 낮 시간 밖 칸은 흐리게.
- 만든 JSON은 git에 넣지 않는다.
