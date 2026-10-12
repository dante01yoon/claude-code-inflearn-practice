# 섹션 10 · 73강 claude -p와 JSON 출력으로 스크립트에 넣기

## 이번 수업에서 할 것
- 자동화 네 가지와 도는 곳: `claude -p`(내 컴퓨터·스크립트) · GitHub Actions(깃허브 서버) · 루틴 `/schedule`(앤트로픽 클라우드, 알람 예약) · `/loop`(열어 둔 세션, 잠깐 지켜보기)
- `claude -p`로 한 번 묻고 끝나는 실행, `--output-format json`으로 칸 이름(`result`·`total_cost_usd`·`duration_ms`)으로 꺼내기
- 「서울 라이브 3D」에 **매일 아침 서울 데이터 리포트** 스크립트(`npm run report`)를 붙이고 브라우저로 보기

## 입력한 것 그대로
```bash
claude -p "이 저장소가 무슨 앱인지 한 문장으로 알려 줘"
claude -p "이 저장소가 무슨 앱인지 한 문장으로 알려 줘" --output-format json | jq '{result, total_cost_usd, duration_ms}'
claude --permission-mode auto
```
```text
매일 아침 서울 데이터 리포트를 만드는 스크립트를 만들어 줘. 실시간 도시데이터랑 따릉이 현황을 받아서 claude -p로 요약을 JSON으로 받고, reports 폴더에 저장해서 브라우저로 볼 수 있게
커밋해 줘
```
```bash
npm run report        # → reports/YYYY-MM-DD.json, 보기: npm start 후 http://127.0.0.1:8000/reports/
```

## 결과 (녹화 1회, 2026-10-13 05:21 KST · Claude Code 2.1.296 · Opus 5.5)
- 클로드 작업 3분 58초. 만든 파일: `realtime-bikes.mjs`(따릉이 현황), `daily-report.mjs`(숫자 정리·스키마·프롬프트), `scripts/daily-report.mjs`(실행), `reports/index.html`(보기 화면), `tests/daily-report.test.mjs`. 테스트 128개 통과(4개 건너뜀).
- 핵심: `claude -p --output-format json --json-schema <REPORT_SCHEMA> --tools ""`를 **임시 폴더**에서, 질문은 표준 입력으로 → 결과의 `structured_output`만 사용. `.env` 값은 넘기지 않음.
- 1회 약 $0.04~0.06(API 가격 환산 추정치), 11~12초. 공개 `sample` 키라 도시데이터 1곳(광화문·덕수궁)·따릉이 대여소 5곳만 받음 — 클로드가 요약에 스스로 밝힘.
- 만든 리포트 JSON(`reports/*.json`)은 `.gitignore`로 빠지고 보기 화면만 커밋(f7dfeb0).
- 첫 `claude -p`의 `total_cost_usd`는 0.13달러(저장소 맥락을 읽어서). 구독 로그인이면 실제 청구는 아니고 추정치입니다.

## 공식 문서 (2026-10-12 확인)
- [Claude Code를 프로그래밍 방식으로 실행하기](https://code.claude.com/docs/ko/headless) — `-p`/`--print`, `--output-format text|json|stream-json`, `--json-schema` → `structured_output`, `--bare`(API 키 필요 — 구독 로그인 강의에서는 쓰지 않음)

## 근거 데이터
- 서울 실시간 도시데이터(citydata_ppltn), 서울시 공공자전거 실시간 대여정보(bikeList) — 서울 열린데이터광장, 서울특별시, 공공누리 1유형. 공개 sample 키.

## 앱 저장소
[dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) 브랜치 `sec10-automation`.
