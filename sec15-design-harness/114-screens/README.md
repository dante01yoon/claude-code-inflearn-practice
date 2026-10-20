# 화면 조립 — 토큰과 컴포넌트로만

앞 수업 solution에서 이어갑니다. 지도 바탕 `data/map-base@2x.png`는 OpenStreetMap 데이터(ODbL)로 직접 그린 그림(`data/render_map.py`), 대여소는 서울 열린데이터광장 OA-15493 실제 스냅샷(`data/stations.json`, 공공누리 제1유형).

`claude -c` → "이제 화면 조립해줘. 지도 바탕은 data/map-base@2x.png를 쓰고 출처는 © OpenStreetMap만 적으면 돼. 고정 px 세 곳은 그대로 둬도 괜찮아"
실제 실행 4분 27초: Screens 페이지 8화면(map 기본 · 반납 · 불러오는 중 · 결과 없음 · 오류, station 기본 · 0대, list), `npm run check` 실패 0, `npm run lint:figma` 오류 0 · 경고 3. 클로드가 남긴 "정해 주실 것" 5가지(핀 겹침, 선택 핀이 시트에 가려짐 등)는 다음 검증 수업의 재료입니다.

화면 PNG: `solution/design-harness/work/ttareungyi/figma/screens/`. 프롬프트 원문: [PROMPTS.md](PROMPTS.md)
