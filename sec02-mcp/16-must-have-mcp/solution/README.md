# 서울 라이브 3D (섹션 1 실습판)

강의 내내 키워 갈 「서울 라이브 3D」의 첫 모습입니다. 섹션 1에서는 지하철 역 몇 곳의 시간대별 승하차 인원을 화면에 띄우면서 클로드 코드의 핵심 기능을 익힙니다.

## 데이터
- `data/subway-hourly-202607.json` — 서울 열린데이터광장 「서울시 지하철 호선별 역별 시간대별 승하차 인원 정보」(CardSubwayTime) 2026년 7월분.
  공개 `sample` 키로 받은 앞쪽 5행(1호선 서울역·시청·종각·종로3가·종로5가)을 그대로 저장했습니다.
  값은 한 달 동안의 합계입니다(예: `HR_8_GET_ON_NOPE` = 7월 한 달 동안 08시대에 그 역에서 탄 사람 수).
- 받은 주소: `http://openapi.seoul.go.kr:8088/sample/json/CardSubwayTime/1/5/202607/`
- 필드: `SBWY_ROUT_LN_NM`(호선), `STTN`(역), `HR_<시>_GET_ON_NOPE`(그 시간대 승차 인원), `HR_<시>_GET_OFF_NOPE`(하차 인원). 시간대는 04시부터 다음 날 03시까지.
- 출처: 서울특별시 (https://data.seoul.go.kr/dataList/OA-12252/S/1/datasetView.do), 공공누리 제1유형(출처 표시).

## 보기
`index.html`(표) 또는 `map.html`(deck.gl 3D 지도)을 브라우저로 열거나, 이 폴더에서 `python3 -m http.server 8000` 후 http://127.0.0.1:8000 을 엽니다.
