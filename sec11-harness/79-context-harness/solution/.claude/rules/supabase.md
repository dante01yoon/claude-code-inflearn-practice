---
paths:
  - "citydata-store.mjs"
  - "db-status.mjs"
  - "scripts/collect-citydata.mjs"
  - "api/crowd-history.js"
  - "api/config.js"
  - "server.mjs"
  - "subway.html"
  - "admin.html"
  - "supabase/**"
  - "tests/citydata-store.test.mjs"
---

# Supabase(붐빔 기록·로그인·관리자)

- `citydata-store.mjs` + `scripts/collect-citydata.mjs`(`npm run collect`, `-- --watch`면 5분마다): 도시데이터를 Supabase `crowd_snapshots`에 쌓아 시계열을 만든다(API에는 지난 기록이 없다). 시작할 때 영역 zip으로 `places`를 맞추고, PostgREST에 fetch로 upsert한다(`(place_code, observed_at)` 중복은 무시, `observed_at`은 `PPLTN_TIME`을 KST로). 테이블 check에 걸릴 행은 미리 뺀다. 키는 `.env`의 `SUPABASE_URL`·`SUPABASE_SERVICE_ROLE_KEY`(RLS 우회, 서버 전용).
- 기록 읽기: `createCrowdHistory`(`citydata-store.mjs`, 최근 24시간·1분 캐시, 장소 코드 `POI\d{3}`만) → `/api/crowd-history?code=`(`server.mjs`, `api/crowd-history.js`). 키는 읽기 전용 `SUPABASE_PUBLISHABLE_KEY`. `subway.html`에서 영역을 누르면(`selectPlace`) `#history-panel`에 SVG 그래프를 칸의 실제 폭으로 그린다(`renderHistory`, 12분 넘게 빈 곳은 선을 끊음). 그 아래 지금 연령대 비율 막대(`renderAges`)는 실시간 도시데이터의 `ages`로 그리고, 받지 못한 장소면 숨긴다.
- `db-status.mjs`: DB(Supabase)가 꺼졌거나 닿지 않는 경우 판별(`isDbUnavailable`: PostgREST `PGRST00x`·5xx, fetch 실패)과 안내 문구(`DB_DOWN_MESSAGE`, `dbErrorText`). 붐빔 기록 읽기는 이때 `DbUnavailableError`를 던지고 `/api/crowd-history`는 503 `{ error, retry: true }`로 답한다(로그는 스택 없이 한 줄). 화면의 Supabase 오류 문구는 `dbErrorText`로 만든다.
- 로그인·즐겨찾기·알림(`subway.html`의 `#account`): Supabase Auth 이메일 OTP(6자리 코드, 로컬은 Mailpit http://127.0.0.1:54424). supabase-js 2.45.4를 jsDelivr `+esm`으로 불러오고, 주소와 publishable 키는 `/api/config`(`server.mjs`, `api/config.js`)로 받는다. 즐겨찾기는 `favorites`(장소, `notify_level`)·`favorite_stations`(역명, `notify_ratio`)에 본인 행만(RLS). null이면 알림 끔.
- 관리자 화면 `admin.html`: 로그인(OTP, `shouldCreateUser: false`) 후 `sb.rpc("admin_dashboard")` 하나로 수집 상태·API 호출/실패(`collect_runs`)·사용자 수를 받는다. 관리자 판별은 DB의 `admin_users` + security definer 함수(`is_admin`, `admin_dashboard`, 아니면 42501). 두 테이블은 anon·authenticated 권한이 없다. 함수 실행 권한은 anon에서도 거두지 않는다 — 로컬 Supabase 이미지(PG 17.6)는 실행 권한 없는 함수를 부르면 백엔드가 세그폴트로 죽는다. `collect_runs` 행은 수집기가 `toRunRow`/`saveRun`(`citydata-store.mjs`)으로 남기고, 수집기는 캐시 없이(`createCitydataSource(key, loadCodes, 0)`) 매번 묻는다.
