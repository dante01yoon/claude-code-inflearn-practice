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

### Vercel 배포
`vercel deploy`(미리보기)로 올립니다. 정적 파일은 그대로 내보내고 `/api/trains`는 `api/trains.js` 함수가 맡습니다(`server.mjs`와 같은 `realtime-trains.mjs`를 씀). 인증키는 Vercel 환경 변수 `SEOUL_REALTIME_KEY`에서 읽으며, 없으면 `sample` 키를 씁니다. 환경 변수를 바꾸면 다시 배포해야 반영됩니다. `.vercelignore`가 `.env`를 비롯한 점 파일, 문서, 테스트, `server.mjs`를 올리지 않습니다.

### 실시간 열차 위치 (`subway.html`)
- API: 서울 열린데이터광장 「서울시 지하철 실시간 열차 위치정보」(`realtimePosition`), `http://swopenapi.seoul.go.kr/api/subway/<인증키>/json/realtimePosition/0/<끝>/<노선명>`.
- 인증키는 일반 인증키와 따로 발급하는 **실시간 지하철 인증키**입니다. `.env`에 `SEOUL_REALTIME_KEY=발급받은키`로 넣으면 서버만 읽고 브라우저로 보내지 않습니다. 없으면 공개 `sample` 키를 써서 노선마다 열차 5대만 보입니다.
- 서버는 노선 19개(경전철·인천 1·2호선은 API가 위치를 주지 않음)를 20초에 한 번만 묻고, 화면은 보일 때만 30초마다 다시 받습니다.
- API는 "어느 역에 진입·도착·출발"만 줍니다. 지도 위치는 `subway-lines.mjs`의 역 순서와 역사마스터 좌표로 `train-positions.mjs`가 정합니다.
- 출처: 서울특별시 (https://data.seoul.go.kr/dataList/OA-12601/A/1/datasetView.do), 공공누리 제1유형(출처 표시).

### 실시간 도시데이터 (`subway.html`)
- API: 서울 열린데이터광장 「서울시 실시간 인구데이터」(`citydata_ppltn`), `http://openapi.seoul.go.kr:8088/<인증키>/json/citydata_ppltn/1/5/<장소코드>`. 장소마다 지금 혼잡도·추정 인구 범위와 12시간 예측을 줍니다.
- 인증키는 **일반 인증키**입니다(실시간 지하철 인증키와 다름). `.env`에 `SEOUL_OPENAPI_KEY=발급받은키`로 넣습니다. 없으면 `sample` 키를 쓰는데, sample 키는 어느 장소를 물어도 광화문·덕수궁 1곳만 돌려줍니다.
- 서버는 121곳을 5분에 한 번(동시 8개씩)만 묻습니다. 장소 영역은 `data/raw/citydata/서울시 주요 121장소 영역.zip`을 읽을 때 풀어서 씁니다(`citydata-areas.mjs`).
- API는 지금 값과 예측만 주고 지난 기록은 주지 않습니다. `npm run collect -- --watch`를 켜 두면 5분마다 121곳을 받아 Supabase `crowd_snapshots`에 쌓습니다(한 번만 받으려면 `npm run collect`, crontab 등에서 부를 때). 같은 장소·같은 시각(`PPLTN_TIME`)은 한 번만 들어갑니다.
  `.env`에 `SUPABASE_URL`(로컬은 `http://127.0.0.1:54421`)과 `SUPABASE_SERVICE_ROLE_KEY`(`npx supabase status`의 Secret 키)를 넣습니다. 이 키는 RLS를 우회하므로 브라우저 코드에 넣지 않습니다.
- 지도에서 장소 영역을 누르면 쌓인 기록 중 최근 24시간을 작은 그래프로 보여 줍니다(선 = 추정 인구 범위의 가운데, 회색 띠 = 범위, 아래 띠 = 혼잡도, 수집이 멈춘 구간은 끊김). 서버가 `/api/crowd-history?code=POI009`로 읽어 주며, `.env`(Vercel은 환경 변수)에 `SUPABASE_URL`과 `SUPABASE_PUBLISHABLE_KEY`(`npx supabase status`의 Publishable 키, 읽기 전용)가 필요합니다.
- 출처: 서울특별시 (https://data.seoul.go.kr/dataList/OA-21778/S/1/datasetView.do), 공공누리 제1유형(출처 표시).

### 로그인 · 즐겨찾기 · 붐빔 알림 (`subway.html`)
- 이메일로 받은 6자리 코드로 로그인합니다(Supabase Auth). 로컬에서는 메일이 실제로 나가지 않고 Mailpit(http://127.0.0.1:54424)에 쌓입니다.
- 답 카드의 ☆ 내 역, 장소 기록 패널의 ☆ 즐겨찾기로 저장하고, 「내 즐겨찾기 · 붐빔 알림」 패널에서 기준을 고릅니다.
  - 장소: 실시간 혼잡도가 보통 / 약간 붐빔(기본) / 붐빔 이상이면.
  - 내 역: 지금 시간대 승하차(9월 통계)가 그 역 하루 피크의 40–90%(기본 60%) 이상이면. 역에는 실시간 인원 데이터가 없어 통계로 판단합니다.
- 알림은 **페이지가 열려 있는 동안**만 확인합니다. 지금 붐비는 곳은 패널에 늘 보이고, 새로 붐비게 된 곳은 브라우저 알림(「브라우저 알림 켜기」로 허용)을 띄웁니다.
- `.env`(Vercel은 환경 변수)에 `SUPABASE_URL`·`SUPABASE_PUBLISHABLE_KEY`가 필요합니다. 브라우저는 `/api/config`로 이 둘만 받습니다(publishable 키는 공개용이고 권한은 RLS가 막습니다).
- 장소 즐겨찾기는 DB의 `places`를 참조하므로 `npm run collect`를 한 번은 실행해 두어야 합니다. 마이그레이션은 `npx supabase migration up`으로 적용합니다.
- 배포한 Supabase 프로젝트에서는 Authentication → Email Templates의 Magic Link 템플릿에 `{{ .Token }}`(6자리 코드)을 넣어야 코드가 메일에 나옵니다. 로컬 기본 템플릿에는 이미 들어 있습니다.

맨 위 3D 장면은 역마다 승차·하차 기둥을 세우고, 시간 슬라이더로 시간대를 바꾸면 높이가 바뀝니다. 역 좌표는 데이터에 없어 `index.html`에 근사값으로 넣었습니다. 3D 렌더링에는 [Three.js](https://threejs.org/)(MIT, CDN 로드)를 씁니다.

## 권한 설정
`.claude/settings.json`에 테스트·데이터 검사 허용 규칙이 있습니다.
