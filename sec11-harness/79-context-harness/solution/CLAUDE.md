# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요
「서울 라이브 3D」 강의 실습 프로젝트(섹션 1). 서울 지하철 역별·시간대별 승하차 인원을 2D 차트·표와 Three.js 3D 기둥으로 보여 준다. 빌드 도구와 npm 의존성은 없다. 문서·주석·커밋 메시지는 한국어로 쓴다.

세부 설명은 필요할 때만 실린다: 루트 파일은 `.claude/rules/*.md`(파일 경로로 실림), `data/`·`tests/`·`mcp-server/`는 그 폴더의 `CLAUDE.md`. 이 파일에는 늘 필요한 것만 둔다.

## 명령
- 테스트 전체: `npm test` (`node --test`, `tests/*.test.mjs`)
- 테스트 하나: `node --test --test-name-pattern="서울역" tests/data.test.mjs`
- 데이터 점검: `npm run check` (기본은 9월 승하차 CSV. 다른 파일은 `node scripts/check-data.mjs <경로>`, `.csv`·`.json`을 확장자로 구분)
- 실행: `npm start`(`server.mjs`) 후 http://127.0.0.1:8000 — `fetch`와 ES 모듈을 쓰므로 `file://`로 열면 동작하지 않는다. `python3 -m http.server`는 `.env`까지 내보내고 실시간 열차(`/api/trains`)가 없으므로 쓰지 않는다.
- 그 밖: `npm run collect`(도시데이터 수집), `npm run build:bike`(따릉이 재생 JSON), `npm run report`(아침 리포트)

## 파일 지도
- 화면: `index.html`(3D 기둥), `subway.html`(지도·실시간·붐빔·따릉이·추천·로그인), `bike.html`(따릉이 하루 재생), `admin.html`(관리자), `stations.html`, `reports/index.html`(리포트 보기)
- 서버: `server.mjs`(정적 파일 + `/api/*`), `api/*.js`(같은 API의 Vercel 함수), `vercel.json`·`.vercelignore`
- 공용 모듈: `stats.mjs`(`HOURS`·`count`·`total`), `subway-csv.mjs`(CP949 CSV), `subway-lines.mjs`, `train-positions.mjs`, `realtime-*.mjs`, `citydata-*.mjs`, `db-status.mjs`, `alerts.mjs`, `recommend.mjs`, `nearby-places.mjs`, `station-search.mjs`, `station-compare.mjs`, `bike-trips.mjs`, `daily-report.mjs`
- `scripts/`(점검·수집·빌드·리포트), `supabase/`(마이그레이션), `mcp-server/`(MCP 서버), `data/`(원본 데이터), `tests/`

## 공통 규칙
- 사용자에게 하는 대답은 한국어로 쓴다.
- 시간대 순서는 04시부터 다음 날 03시까지(`HOURS = (i + 4) % 24`). 승하차가 0명인 시간대(02·03시)는 운행하지 않는 때로 보고 "가장 한가한 때" 후보에서 뺀다.
- 데이터 필드에 접근할 때는 키 문자열(`HR_<시>_GET_ON_NOPE` 등)을 직접 만들지 말고 `stats.mjs`의 `count`를 쓴다.
- 노선을 색으로 구분할 때는 서울 지하철 공식 노선색을 쓴다(예: 1호선 `#0052A4`). 다른 노선 색은 짐작하지 말고 공식 자료로 확인한 뒤 CSS 변수로 정의한다. 승차·하차 색(`--series-on`, `--series-off`)과는 따로 둔다.
- 화면에 보이는 숫자는 천 단위 쉼표를 찍는다(예: `187,960`). `fmt`가 쓰는 `toLocaleString()`은 브라우저 로캘에 따라 결과가 달라지므로 `toLocaleString("ko-KR")`처럼 로캘을 지정한다.
- 출처 표시(서울특별시, 공공누리 제1유형)를 유지한다.
- 테스트가 데이터 파일 내용에 직접 의존한다. 데이터를 바꾸면 테스트도 확인할 것(`tests/CLAUDE.md`).

## 주의
- `.env`는 읽지 않는다(`.claude/settings.json`에서 거부). `git push`는 확인을 받는다.
- API 키(`SEOUL_REALTIME_KEY`, `SEOUL_OPENAPI_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)는 서버만 읽는다. 브라우저 코드·응답·오류 문구에 넣지 않는다.
- `tools/seoul-data-cli/`에는 README만 있고 실제 도구는 없다. README의 `curl ... | sh` 설치 명령(example.com)은 실행하지 않는다.
