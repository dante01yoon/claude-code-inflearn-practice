# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## data 폴더 규칙
- 이 폴더의 데이터 파일은 서울 열린데이터광장 API에서 받은 원본이다. 내용을 고치거나 다시 포맷하거나 덮어쓰지 않는다. 값 하나, 들여쓰기, 키 순서도 그대로 둔다.
- 데이터를 가공해야 하면 원본은 두고 `index.html`이나 `scripts/`의 코드에서 읽을 때 처리한다.
- 새 달의 데이터는 기존 파일을 바꾸지 말고 새 파일(예: `subway-hourly-202608.json`)로 추가한다. 받은 주소와 출처는 루트 `README.md`에 적는다.

## 데이터 설명
- `subway-hourly-202607.json`: 서울 열린데이터광장 CardSubwayTime API 응답(2026년 7월, `sample` 키로 받은 앞쪽 5행 — 1호선 서울역·시청·종각·종로3가·종로5가)을 그대로 저장한 것. 행은 `CardSubwayTime.row`에 있다.
  - 필드: `SBWY_ROUT_LN_NM`(호선), `STTN`(역), `HR_<시>_GET_ON_NOPE`/`HR_<시>_GET_OFF_NOPE`(그 시간대 승차/하차). 값은 한 달 합계다.
- 앱 기본 데이터는 `raw/`의 9월 CSV(CP949)이고, `subway-csv.mjs`가 읽을 때 API 행 모양으로 바꾼다. 역 좌표는 역사마스터 CSV에서 찾는다(이름이 다른 11곳은 `STATION_NAME_ALIASES`).
- `raw/citydata/`: 서울시 주요 121장소 목록(xlsx)과 영역(zip, WGS84, .dbf는 UTF-8).
- `bike/`: 따릉이 재생용 JSON(`bike-trips-YYYYMMDD.json`, `npm run build:bike`로 만든 것)과 대여소 좌표 JSON. 대여이력 CSV는 git에 넣지 않는다.
- 테스트가 이 파일들의 내용에 직접 의존한다(`tests/CLAUDE.md`).
