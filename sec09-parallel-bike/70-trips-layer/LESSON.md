# 섹션 9 · 70강 하루 수만 건의 이동을 빛의 궤적으로 재생 — deck.gl TripsLayer

## 오늘 할 것
6월 13일(토) 따릉이 이동 13만 4천여 건을 빛나는 꼬리로 하루 동안 재생합니다. 화면이 읽는 데이터를 개인 속성 없는 작은 JSON으로 바꾸고, 밤 지도·긴 꼬리·3D 기울이기로 꾸밉니다.

## 개념 — TripsLayer 네 가지 값
1. 경로 `getPath`: 빌린 대여소 → 반납 대여소(대여이력에 실제 경로가 없어 직선)
2. 타임스탬프 `getTimestamps`: 빌린 시각·반납 시각(그날 0시부터 초)
3. 지금 시각 `currentTime`: 재생·슬라이더가 바꾸는 값 하나
4. 꼬리 길이 `trailLength`: 지금보다 얼마 전까지 흐리게 남길지

경로·시각은 처음 한 번만 만들고, 재생 중에는 지금 시각만 바뀝니다.

## 실습 (입력한 것 그대로)
```text
bike.html이 지금은 원본 CSV를 읽잖아. 재생에 필요한 값만 담은 작은 JSON으로 바꿔 줘. 생년·성별 같은 건 빼고
```
→ `data/bike/bike-trips-20260613.json`(2.9MB, `{day, source, total, skipped, from[], to[], start[], end[]}`), `scripts/build-bike-trips.mjs`(`npm run build:bike`, CSV가 있을 때 다시 만들기), 테스트 86개.
```text
궤적이 잘 안 보여. 밤 지도처럼 어둡게 하고, 꼬리는 빛나는 색으로 길게, 지도는 3D로 비스듬히 기울여 줘
커밋해 줘
```
⚠️ 첫 부탁 장면의 녹화 파일이 녹화 프로그램 오류로 저장되지 않아, 같은 상태(69강 끝)의 사본에서 같은 부탁을 한 번 더 실행해 녹화했습니다(1분 32초, JSON 2.8MB·테스트 86개, 커밋하지 않음). 저장소의 파일은 처음 실행 결과(2.9MB)입니다.
⚠️ 두 번째 부탁은 입력 직후 녹화 프로그램이 멈춘 사이 클로드가 처리했습니다. `claude --continue`로 이어 보니 "이미 들어가 있다"고 답했고, 커밋은 두 개(872c8b8(영상 속 0535f73) 재생용 JSON, 670414c(영상 속 27ccef8) 밤 지도·빛 꼬리 15→40분·pitch 55).

핵심 코드(bike.html): 이동마다 `pathBuf`(출발·도착 좌표)·`timeBuf`(시작·끝 시각)를 한 번 채우고, `TripsLayer`를 두 번(넓고 흐린 번짐 `getWidth: 6` + 가늘고 밝은 심 `1.4`) `trailLength: 2400`(40분), `currentTime: time`으로 그립니다.

결과 화면: `npm start` 후 http://127.0.0.1:8000/bike.html — 3,600배 재생, 07:36 이동 중 806대, 18:00 이동 중 3,223대(녹화 화면 값).

## 근거
- deck.gl 9.0.38 TripsLayer(`@deck.gl/geo-layers`, 단일 번들 `deck.gl/dist.min.js`에 포함)
- 데이터: 서울특별시 공공자전거 대여이력 정보(2026년 6월), 공공자전거 대여소 정보(26.6월 기준) — 서울특별시, 공공누리 1유형


## 앱 저장소
[dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) 브랜치 `sec09-bike` → main 로컬 머지 `e586b13`. 공개 전에 하루 치 원본 CSV(생년·성별 열 포함)를 `git filter-branch`로 sec09-bike 이력에서 지워서, 원본 CSV가 든 커밋은 해시가 바뀌었습니다(괄호 안이 영상에 보이는 해시).
