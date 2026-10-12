# 서울 라이브 3D

인프런 강의 「클로드 코드 실전」에서 클로드 코드로 함께 키워 가는 실습 앱입니다. 수업별 시작·정답 파일은 [claude-code-inflearn-practice](https://github.com/dante01yoon/claude-code-inflearn-practice)에 있습니다.

`.env.example`을 `.env`로 복사해 쓰세요(서울 열린데이터광장 공개 `sample` 키).

## 지금 단계 (섹션 1 Git 수업까지)

강의 내내 키워 갈 「서울 라이브 3D」의 첫 모습입니다. 섹션 1에서는 지하철 역 몇 곳의 시간대별 승하차 인원을 화면에 띄우면서 클로드 코드의 핵심 기능을 익힙니다.

## 데이터
- `data/subway-hourly-202607.json` — 서울 열린데이터광장 「서울시 지하철 호선별 역별 시간대별 승하차 인원 정보」(CardSubwayTime) 2026년 7월분.
  공개 `sample` 키로 받은 앞쪽 5행(1호선 서울역·시청·종각·종로3가·종로5가)을 그대로 저장했습니다.
  값은 한 달 동안의 합계입니다(예: `HR_8_GET_ON_NOPE` = 7월 한 달 동안 08시대에 그 역에서 탄 사람 수).
- 받은 주소: `http://openapi.seoul.go.kr:8088/sample/json/CardSubwayTime/1/5/202607/`
- 필드: `SBWY_ROUT_LN_NM`(호선), `STTN`(역), `HR_<시>_GET_ON_NOPE`(그 시간대 승차 인원), `HR_<시>_GET_OFF_NOPE`(하차 인원). 시간대는 04시부터 다음 날 03시까지.
- 출처: 서울특별시 (https://data.seoul.go.kr/dataList/OA-12252/S/1/datasetView.do), 공공누리 제1유형(출처 표시).

### 원본 CSV (`data/raw/`, 2026년 9월)
열린데이터광장에서 내려받은 CSV를 그대로 저장했습니다. 두 파일 모두 인코딩은 **CP949**이고, 내용은 고치지 않습니다(가공은 읽을 때 코드에서 합니다).

- `data/raw/서울시 지하철 호선별 역별 시간대별 승하차 인원 정보.csv` — 기준 달 2026년 9월(`사용월` 202609), 621행(머리글 제외).
  열 이름이 API와 다릅니다(`04시-05시 승차인원` ↔ `HR_4_GET_ON_NOPE`, 23시 열은 `23시-24시`).
  - 받은 주소: https://data.seoul.go.kr/dataList/OA-12252/S/1/datasetView.do
- `data/raw/서울시 역사마스터 정보.csv` — 기준 달 2026년 9월. 역 위치(`역사_ID`, `역사명`, `호선`, `위도`, `경도`), 784행(노선별 지점).
  - 받은 주소: https://data.seoul.go.kr/dataList/OA-21232/S/1/datasetView.do
- 출처: 서울특별시, 공공누리 제1유형(출처 표시).

## 보기
이 폴더에서 `npm start`(Node 22 이상) 후 http://127.0.0.1:8000 을 엽니다. 데이터를 `fetch`로 읽고 ES 모듈을 쓰기 때문에 `index.html`을 파일로 바로 열면(`file://`) 동작하지 않습니다.

`server.mjs`는 저장소 파일을 내보내면서 `/api/trains`로 실시간 열차 위치를 대신 받아 줍니다. `.env`, `.git`처럼 점으로 시작하는 경로는 내보내지 않습니다. `python3 -m http.server`로 열어도 승하차 화면은 보이지만 실시간 열차는 나오지 않고, `.env`까지 그대로 내보내므로 쓰지 않는 편이 좋습니다.

### 실시간 열차 위치 (`subway.html`)
- API: 서울 열린데이터광장 「서울시 지하철 실시간 열차 위치정보」(`realtimePosition`), `http://swopenapi.seoul.go.kr/api/subway/<인증키>/json/realtimePosition/0/<끝>/<노선명>`.
- 인증키는 일반 인증키와 따로 발급하는 **실시간 지하철 인증키**입니다. `.env`에 `SEOUL_REALTIME_KEY=발급받은키`로 넣으면 서버만 읽고 브라우저로 보내지 않습니다. 없으면 공개 `sample` 키를 써서 노선마다 열차 5대만 보입니다.
- 서버는 노선 19개(경전철·인천 1·2호선은 API가 위치를 주지 않음)를 20초에 한 번만 묻고, 화면은 보일 때만 30초마다 다시 받습니다.
- API는 "어느 역에 진입·도착·출발"만 줍니다. 지도 위치는 `subway-lines.mjs`의 역 순서와 역사마스터 좌표로 `train-positions.mjs`가 정합니다.
- 출처: 서울특별시 (https://data.seoul.go.kr/dataList/OA-12601/A/1/datasetView.do), 공공누리 제1유형(출처 표시).

맨 위 3D 장면은 역마다 승차·하차 기둥을 세우고, 시간 슬라이더로 시간대를 바꾸면 높이가 바뀝니다. 역 좌표는 데이터에 없어 `index.html`에 근사값으로 넣었습니다. 3D 렌더링에는 [Three.js](https://threejs.org/)(MIT, CDN 로드)를 씁니다.

## 권한 설정
`.claude/settings.json`에 테스트·데이터 검사 허용 규칙이 있습니다.
