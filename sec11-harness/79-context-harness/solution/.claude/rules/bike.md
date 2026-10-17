---
paths:
  - "bike.html"
  - "bike-trips.mjs"
  - "subway-csv.mjs"
  - "subway.html"
  - "scripts/build-bike-trips.mjs"
  - "tests/bike-trips.test.mjs"
---

# 따릉이 하루 재생

- `bike.html` + `bike-trips.mjs`: 날짜는 `BIKE_DAYS`(2026-06-13 토, 2026-06-10 수; 첫째가 기본 `BIKE_DAY`, subway.html은 기본만 씀), 경로는 `bikeCsv(day)`·`bikeTripsJson(day)`. `bike.html`은 머리글 버튼(`?day=`)으로 날짜를 바꾸고, 바꿔도 시각·재생·시점은 유지한다(날짜별 데이터는 `prepare`로 한 번만 만들어 둠).
- 날짜마다 대여이력 CSV(CP949, `subway-csv.mjs`의 `decodeCsv`·`parseCsv`)를 `npm run build:bike`(`scripts/build-bike-trips.mjs`)가 재생용 JSON `data/bike/bike-trips-YYYYMMDD.json`(`toTripsJson`: 열마다 배열 `from`·`to`(대여소 번호)·`start`·`end`, 이용자 정보·자전거번호 없음)으로 뽑고, 화면은 그 JSON과 대여소 좌표 JSON을 읽을 때 합친다(`fromTripsJson`, `loadBikeTrips`).
- CSV → 이동(`toTrips(rows, coords, day)`, 시각은 그날 00:00 KST 기준 초, 다음 날 반납은 86400 이상)으로 바꾼다. CSV 대여소번호 `"01028"` ↔ 좌표 키 `"1028"`(`stationKey`). 버린 행은 이유별로 센다(`skipped`: `badTime`·`noReturn`(반납 대여소번호 빔)·`noCoords`, 먼저 걸린 하나만).
- 화면은 deck.gl `TripsLayer`(대여소 사이 직선), 같은 대여소 반납(`round`)은 이용 중 점, 재생은 24:00에서 끝나고 넘긴 이용은 24:00까지만 그린다.
- `subway.html`의 따릉이 레이어: `loadBikeTrips` → `toServiceDay`(04시 전에 시작한 이동을 하루 끝으로 옮겨 운행 하루로) → `TripsLayer`(`--bike`, 꼬리 20분, 같은 대여소 반납은 그리지 않음). 2026-06-13 기록이라 오늘 값이 아니다.
- 대여이력 CSV는 이용자 정보 열 때문에 git에 넣지 않는다(`.gitignore`, 만드는 법은 README). CSV를 바꾸면 `npm run build:bike`. 테스트 기대값은 `tests/CLAUDE.md`.
