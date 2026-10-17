# tests

`node --test`로 돌린다. 몇몇 테스트는 데이터 파일 내용에 직접 의존하므로, 데이터를 바꾸면 아래 기대값도 확인한다.

- `data.test.mjs`: 9월 승하차 CSV(621행, 역명 528개, 가산디지털단지 값 등).
- `stats.test.mjs`: 7월 JSON `data/subway-hourly-202607.json`(1호선 5개 역).
- `citydata.test.mjs`: 121장소 영역 zip(121곳·분류별 개수·북서울꿈의숲 2조각).
- `subway-lines.test.mjs`: `SUBWAY_LINES`의 역 사이 거리·꺾임 검사.
- `bike-trips.test.mjs`: 실제 데이터 테스트가 날짜마다 재생용 JSON에 의존한다(`EXPECTED`: 13일 135,181행·134,455건·skipped `{6, 720, 0}`, 10일 156,472행·155,526건·`{97, 849, 0}`, 시별 건수 등). CSV가 있으면 JSON이 CSV에서 새로 만든 것과 같은지도 본다(CSV를 바꾸면 `npm run build:bike`).
