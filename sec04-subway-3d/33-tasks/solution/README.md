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
이 폴더에서 `python3 -m http.server 8000` 후 http://127.0.0.1:8000 을 엽니다. 데이터를 `fetch`로 읽고 ES 모듈을 쓰기 때문에 `index.html`을 파일로 바로 열면(`file://`) 동작하지 않습니다.

맨 위 3D 장면은 역마다 승차·하차 기둥을 세우고, 시간 슬라이더로 시간대를 바꾸면 높이가 바뀝니다. 역 좌표는 데이터에 없어 `index.html`에 근사값으로 넣었습니다. 3D 렌더링에는 [Three.js](https://threejs.org/)(MIT, CDN 로드)를 씁니다.

## 권한 설정
`.claude/settings.json`에 테스트·데이터 검사 허용 규칙이 있습니다.
