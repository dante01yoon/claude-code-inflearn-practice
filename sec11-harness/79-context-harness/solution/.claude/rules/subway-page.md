---
paths:
  - "subway.html"
  - "alerts.mjs"
  - "recommend.mjs"
  - "nearby-places.mjs"
  - "station-search.mjs"
  - "station-compare.mjs"
  - "tests/alerts.test.mjs"
  - "tests/recommend.test.mjs"
  - "tests/nearby-places.test.mjs"
  - "tests/station-search.test.mjs"
  - "tests/station-compare*.test.mjs"
---

# subway.html 기능(슬라이더·알림·추천·역 찾기·비교)

- 시간 슬라이더(`#hour`)는 하나로 지하철·붐빔·따릉이를 함께 움직인다. 값은 운행 하루(04:00–다음 날 03:59)의 분(`minute`, `setMinute`), 시간대는 `hourIdx()`(HOURS 번호). 시간대가 바뀔 때만 TOP 5·붐빔 요약·추천을 다시 그리고, 재생은 `requestAnimationFrame`으로 1시간 = 2초(`HOUR_MS`). 처음 값은 지금(KST).
- `alerts.mjs`: 알림 판단(`activeAlerts`, `newAlerts`). 장소 = 실시간 혼잡도가 고른 단계 이상, 역 = 지금(KST) 시간대 승하차가 그 역 피크의 고른 % 이상(9월 통계, 실시간 아님). 페이지가 열려 있는 동안만 1분마다(장소는 도시데이터를 받을 때도) 확인하고, 붐비지 않다가 붐비게 된 곳만 브라우저 알림을 띄우고, 같은 장소는 한 번 울린 뒤 1시간(`PLACE_ALERT_COOLDOWN_MS`, `throttleAlerts`) 동안 다시 울리지 않는다. 첫 확인과 기준을 바꾼 직후는 기준점만 잡는다. 장소 알림이 켜져 있으면 레이어를 숨기거나 탭이 뒤에 있어도 도시데이터를 계속 받는다. 혼잡도 단계 `CONGEST_LEVELS`는 `citydata-areas.mjs`에 있다.
- `recommend.mjs` + 「어디로 무엇을 타고 갈까」(`renderReco`): 그 시각 혼잡도가 낮은 장소를 고르고(없으면 가까운 역의 피크 대비 승하차로), 수단(걸어서·따릉이·지하철)은 `chooseMode` 규칙(출발 역에서의 거리, 운행 여부, 도착 역 붐빔, `DOCK_RADIUS_M` 안 대여소)으로 정한다. 출발 역 = 고른 역. 운행 여부는 노선 전체 승하차가 피크 시간대의 2% 이상인 시간대에 그 역이 하루 1명 이상(`stationAt`). 장소 근처 역·대여소는 `itemsNearArea`(`nearby-places.mjs`), 대여소별 시간대 건수는 `dockActivity`(`bike-trips.mjs`).
- `nearby-places.mjs`: 역 좌표에서 도시데이터 영역 경계까지 거리(m, 안이면 0)를 재서 `NEARBY_RADIUS_M`(500m) 안의 장소를 가까운 순으로 `NEARBY_LIMIT`(3)곳까지 고른다(`nearbyAreas`). 답 카드의 「가까운 장소 · 지금 혼잡도」(`renderNearby`)가 쓰고, 누르면 `selectPlace`로 붐빔 기록을 연다.
- `station-search.mjs`: 역 찾기(`searchStations`). 이름 일부나 초성으로 찾는다(글자마다 맞춰서 "ㄱㄴ"·"강ㄴ" → 강남, 된소리 초성은 따로 본다). 순서는 이름과 같음 → 앞부분 → 가운데 → 부역명이고, 같으면 하루 승하차(`riders`)가 많은 역 먼저, 그다음 이름순.
- `station-compare.mjs`: 「두 역 비교」(`renderCompare`) 계산(`compareDaily`: 하루 합계·각 역 피크·더 많은 시간대 수·차이가 가장 큰 시간대). 고른 역과 비교할 역을 둘 다 전체 노선 합계 하루 평균으로 꺾은선 2개로 그리고(범례에 「전체 노선 합계」), 눈금은 3D 공통 `yMax`가 아니라 두 역의 최댓값(`niceMax`)이다. 색은 `--compare-a`·`--compare-b`. 주소로 공유: `?compare=강남,홍대입구`로 열면 두 역을 골라 바로 비교하고(`readCompareParam`, 이름이 같거나 부역명 뺀 이름이 같은 역만 `findStationByName`), 두 역을 고르면 주소도 `replaceState`로 바꾼다(`compareSearch`, 다른 파라미터는 유지). 「링크 복사」 버튼(`#cmp-share`).
