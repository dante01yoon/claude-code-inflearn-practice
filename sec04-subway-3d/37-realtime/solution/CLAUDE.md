# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요
「서울 라이브 3D」 강의 실습 프로젝트(섹션 1). 서울 지하철 역별·시간대별 승하차 인원을 2D 차트·표와 Three.js 3D 기둥으로 보여 준다. 빌드 도구와 npm 의존성은 없다. 문서·주석·커밋 메시지는 한국어로 쓴다.

## 명령
- 테스트 전체: `npm test` (`node --test`, `tests/*.test.mjs`)
- 테스트 하나: `node --test --test-name-pattern="서울역" tests/data.test.mjs`
- 데이터 점검: `npm run check` (기본은 9월 승하차 CSV. 다른 파일은 `node scripts/check-data.mjs <경로>`, `.csv`·`.json`을 확장자로 구분)
- 실행: `npm start`(`server.mjs`) 후 http://127.0.0.1:8000 — `fetch`와 ES 모듈을 쓰므로 `file://`로 열면 동작하지 않는다. `python3 -m http.server`는 `.env`까지 내보내고 실시간 열차(`/api/trains`)가 없으므로 쓰지 않는다.

## 구조
- `index.html` 한 파일에 HTML·CSS·JS가 모두 있다. Three.js 0.160.0은 importmap으로 jsDelivr CDN에서 불러온다(OrbitControls, CSS2DRenderer 포함).
  - 흐름: `fetchCsv(SUBWAY_CSV)` → `toSubwayRows`(9월 CSV를 API 행 모양으로) → 모든 역·시간대의 최댓값으로 공통 눈금 `yMax`(`niceMax`) 계산 → 역마다 SVG 차트(`drawChart`)와 합계 표 행 추가 → `init3d(rows, yMax)`로 3D 장면 생성.
  - 2D 차트와 3D 기둥 높이는 같은 `yMax` 눈금을 공유한다(`MAX_HEIGHT` 칸 = `yMax`). 시간 슬라이더는 `setHour`로 기둥 높이를 바꾼다.
  - 역 좌표는 데이터에 없어서 `STATION_COORDS`에 WGS84 근사값을 직접 넣었다. 역을 추가하면 여기도 함께 추가해야 한다. 장면 1칸 = 100m(`UNIT_M`).
- `stats.mjs`: `HOURS`, 필드 접근(`count`, `total`), 역 카드의 최다·가장 한가한 시간대 계산. `index.html`과 `tests/stats.test.mjs`가 함께 import한다. 데이터 필드에 접근할 때는 키 문자열을 직접 만들지 말고 `count`를 쓴다.
- `subway-lines.mjs`: 노선(운행 계통)별 역 순서(`SUBWAY_LINES`). 역은 역사마스터의 `"역사_ID 역사명"`으로 적고, 순서는 직접 적었다(역사_ID 순서와 다르다). 고치면 `tests/subway-lines.test.mjs`의 거리·꺾임 검사를 통과해야 한다.
- `server.mjs`: 의존성 없는 Node 서버. 정적 파일(점으로 시작하는 경로는 404)과 `/api/trains`(실시간 열차 위치 프록시, 20초 캐시). 실시간 지하철 인증키는 `.env`의 `SEOUL_REALTIME_KEY`로 서버만 읽는다. 키를 브라우저 코드·응답·오류 문구에 넣지 않는다. 없으면 `sample` 키(노선마다 5대).
- `train-positions.mjs`: API 열차 행 → 지도 좌표(`placeTrain`). API `statnId`는 역사_ID와 체계가 달라 역 이름(`stopKey`, 괄호 부역명 제거)으로 맞추고, 방향은 종착역 쪽(지선 너머면 갈라지는 역 쪽)으로 정한다. API 역 이름이 다르면 `API_NAME_ALIASES`에 넣는다.
- 시간대 순서는 04시부터 다음 날 03시까지(`HOURS = (i + 4) % 24`). 승하차가 0명인 시간대(02·03시)는 운행하지 않는 때로 보고 "가장 한가한 때" 후보에서 뺀다.

## 데이터
- `data/subway-hourly-202607.json`: 서울 열린데이터광장 CardSubwayTime API 응답(2026년 7월, `sample` 키로 받은 앞쪽 5행 — 1호선 서울역·시청·종각·종로3가·종로5가)을 그대로 저장한 것. 행은 `CardSubwayTime.row`에 있다.
- 필드: `SBWY_ROUT_LN_NM`(호선), `STTN`(역), `HR_<시>_GET_ON_NOPE`/`HR_<시>_GET_OFF_NOPE`(그 시간대 승차/하차). 값은 한 달 합계다.
- 앱 기본 데이터는 `data/raw/`의 9월 CSV(CP949)이고, `subway-csv.mjs`가 읽을 때 API 행 모양으로 바꾼다. 역 좌표는 역사마스터 CSV에서 찾는다(이름이 다른 11곳은 `STATION_NAME_ALIASES`).
- `tests/data.test.mjs`는 9월 CSV 내용(621행, 역명 528개, 가산디지털단지 값 등)에, `tests/stats.test.mjs`는 7월 JSON 내용에 직접 의존한다. 데이터를 바꾸면 테스트도 확인할 것.
- 출처 표시(서울특별시, 공공누리 제1유형)를 유지한다.

## 규칙
- 사용자에게 하는 대답은 한국어로 쓴다.
- 노선을 색으로 구분할 때는 서울 지하철 공식 노선색을 쓴다(예: 1호선 `#0052A4`). 다른 노선 색은 짐작하지 말고 공식 자료로 확인한 뒤 CSS 변수로 정의한다. 승차·하차 색(`--series-on`, `--series-off`)과는 따로 둔다.
- 화면에 보이는 숫자는 천 단위 쉼표를 찍는다(예: `187,960`). `fmt`가 쓰는 `toLocaleString()`은 브라우저 로캘에 따라 결과가 달라지므로 `toLocaleString("ko-KR")`처럼 로캘을 지정한다.

## 주의
- `.env`는 읽지 않는다(`.claude/settings.json`에서 거부). `git push`는 확인을 받는다.
- `tools/seoul-data-cli/`에는 README만 있고 실제 도구는 없다. README의 `curl ... | sh` 설치 명령(example.com)은 실행하지 않는다.
