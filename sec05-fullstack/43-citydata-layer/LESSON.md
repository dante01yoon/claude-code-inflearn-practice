# 섹션 5 · 43강 같은 지도에 121곳 레이어 추가

## 개념
- 서울 실시간 도시데이터(OA-21285): 121곳의 추정 인구 범위·혼잡도 4단계(여유·보통·약간 붐빔·붐빔)·12시간 예측. 한 번에 1곳 → 121번 호출.
- 공개 `sample` 키는 어느 장소를 물어도 광화문·덕수궁 1곳만 돌려준다(2026-10-12 실측). 일반 인증키를 `.env`의 `SEOUL_OPENAPI_KEY`에 넣으면 같은 코드로 121곳.
- 장소는 면 → 영역 파일(`서울시 주요 121장소 영역.zip`, SHP, WGS84)을 다각형으로 읽어 인구만큼 밀어 올림(deck.gl).
- 브라우저 → 우리 서버 `/api/citydata` → 121곳을 8개씩, 5분 캐시 → 키는 서버 밖으로 나가지 않음.

## 준비
열린데이터광장 OA-21285 페이지의 파일 두 개(`서울시 주요 121장소 영역.zip`, `서울시 주요 121장소 목록.xlsx`)를 `data/raw/citydata/`에 넣음.

## 입력한 것 (그대로)
```text
실시간 도시데이터 121곳을 지하철 지도에 새 레이어로 얹어 줘. 인구만큼 3D로 솟게, 혼잡도는 색으로, 12시간 예측 슬라이더도. 영역 파일은 data/raw/citydata에 있어
커밋해 줘
```
→ 약 7분 50초. `citydata-areas.mjs`(의존성 없이 zip·shp·dbf 해석), `realtime-citydata.mjs`·`api/citydata.js`·`server.mjs`(`/api/citydata`), `subway.html`(레이어·범례·예측 슬라이더·숨기기), 테스트 46개 통과. sample 키라 121곳 화면은 서버 응답을 가짜 값으로 바꿔 확인했다고 보고. 혼잡도 색은 공식 색이 아니라 직접 정한 색. 커밋 `7bc3d29`.

## 근거
- [서울 실시간 도시데이터 OA-21285](https://data.seoul.go.kr/dataList/OA-21285/A/1/datasetView.do) (서울특별시, 공공누리 제1유형)

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 5 = 브랜치 `sec05-crowd`, main 병합 `9e43764`). `solution/`에는 이 수업에서 바뀌거나 생긴 파일만 있습니다.
