---
paths:
  - "index.html"
  - "stats.mjs"
  - "tests/stats.test.mjs"
---

# index.html(3D 기둥)·stats.mjs

- `index.html` 한 파일에 HTML·CSS·JS가 모두 있다. Three.js 0.160.0은 importmap으로 jsDelivr CDN에서 불러온다(OrbitControls, CSS2DRenderer 포함).
  - 흐름: `fetchCsv(SUBWAY_CSV)` → `toSubwayRows`(9월 CSV를 API 행 모양으로) → 모든 역·시간대의 최댓값으로 공통 눈금 `yMax`(`niceMax`) 계산 → 역마다 SVG 차트(`drawChart`)와 합계 표 행 추가 → `init3d(rows, yMax)`로 3D 장면 생성.
  - 2D 차트와 3D 기둥 높이는 같은 `yMax` 눈금을 공유한다(`MAX_HEIGHT` 칸 = `yMax`). 시간 슬라이더는 `setHour`로 기둥 높이를 바꾼다.
  - 역 좌표는 데이터에 없어서 `STATION_COORDS`에 WGS84 근사값을 직접 넣었다. 역을 추가하면 여기도 함께 추가해야 한다. 장면 1칸 = 100m(`UNIT_M`).
- `stats.mjs`: `HOURS`, 필드 접근(`count`, `total`), 역 카드의 최다·가장 한가한 시간대 계산. `index.html`과 `tests/stats.test.mjs`가 함께 import한다.
