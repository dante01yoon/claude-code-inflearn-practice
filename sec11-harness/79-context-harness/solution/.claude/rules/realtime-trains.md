---
paths:
  - "server.mjs"
  - "api/**"
  - "vercel.json"
  - "realtime-trains.mjs"
  - "train-positions.mjs"
  - "subway-lines.mjs"
  - "tests/subway-lines.test.mjs"
  - "tests/train-positions.test.mjs"
---

# 서버·실시간 열차·노선

- `server.mjs`: 의존성 없는 Node 서버. 정적 파일(점으로 시작하는 경로는 404)과 `/api/trains`(실시간 열차 위치 프록시, 20초 캐시), `/api/citydata`, `/api/crowd-history`, `/api/config`. 실시간 지하철 인증키는 `.env`의 `SEOUL_REALTIME_KEY`로 서버만 읽는다. 키를 브라우저 코드·응답·오류 문구에 넣지 않는다. 없으면 `sample` 키(노선마다 5대).
- `api/*.js`는 같은 API의 Vercel 함수다. 키는 Vercel 환경 변수. Vercel 설정은 `vercel.json`(빌드 없음)과 `.vercelignore`(점 파일 제외).
- `realtime-trains.mjs`: 실시간 열차 위치 API 호출·20초 캐시·키 가리기(`createTrainsSource`). `server.mjs`와 `api/trains.js`(키는 Vercel 환경 변수 `SEOUL_REALTIME_KEY`)가 함께 쓴다.
- `subway-lines.mjs`: 노선(운행 계통)별 역 순서(`SUBWAY_LINES`). 역은 역사마스터의 `"역사_ID 역사명"`으로 적고, 순서는 직접 적었다(역사_ID 순서와 다르다). 고치면 `tests/subway-lines.test.mjs`의 거리·꺾임 검사를 통과해야 한다.
- `train-positions.mjs`: API 열차 행 → 지도 좌표(`placeTrain`). API `statnId`는 역사_ID와 체계가 달라 역 이름(`stopKey`, 괄호 부역명 제거)으로 맞추고, 방향은 종착역 쪽(지선 너머면 갈라지는 역 쪽)으로 정한다. API 역 이름이 다르면 `API_NAME_ALIASES`에 넣는다.
