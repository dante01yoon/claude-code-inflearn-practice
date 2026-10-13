# 섹션 5 · 45강 5분마다 스냅샷 쌓기 — 공공 API에 없는 시계열 만들기

## 개념
- 스냅샷 = 5분마다 찍는 사진첩. 같은 장소·시각은 한 번만(44강 unique).
- 5분마다 누가 돌리나: ① 내 컴퓨터에서 켜 두기(`npm run collect -- --watch`) ② Vercel 크론(Hobby는 하루 1번까지, 더 잦으면 배포 실패) ③ Supabase pg_cron.

## 입력한 것 (그대로)
```text
5분마다 도시데이터를 DB에 저장해서, 공공 API에 없는 시계열을 직접 쌓아 줘
쌓인 기록을 지도에서 장소를 고르면 작은 그래프로 보여 줘
커밋해 줘
```
→ `citydata-store.mjs`(KST→UTC 변환, 잘못된 행 빼기), `scripts/collect-citydata.mjs`(`npm run collect`, `--watch` 5분), 테스트 51개, 두 번 수집해 중복 건너뛰기 확인. 그래프: `/api/crowd-history?code=POI009`(서버가 대신 읽음), 가운데값 선 + 최소~최대 띠 + 혼잡도 띠, 12분 넘게 비면 선을 끊음. 확인용 가짜 기록 241행은 확인 후 삭제. 커밋 `093bb34`.

## 직접 할 일
```text
# .env (저장소에 올리지 않음)
SUPABASE_URL=http://127.0.0.1:54421
SUPABASE_SERVICE_ROLE_KEY=<npx supabase status 의 Secret 키>
SUPABASE_PUBLISHABLE_KEY=<npx supabase status 의 Publishable 키>
SEOUL_OPENAPI_KEY=<43강에서 넣은 일반 인증키>   # 없으면 sample 키 = 광화문·덕수궁 1곳만
```
```bash
npm run collect -- --watch
```
촬영 때 쌓인 기록(2026-10-13, 내 일반 인증키): 측정 시각 20:05 KST부터 약 3시간, 121곳 기록 2,899행. 5분마다 「받음 121곳, 새 기록 121행」, 같은 측정 시각이면 「이미 있음」. 가끔 몇 곳이 API 오류(JSON 대신 XML 응답)로 빠졌다가(116곳) 다음 차례에 다시 받음 — 수집기는 멈추지 않음.
- 홍대 관광특구 그래프: 기록 22개, 20:05 보통 76,000~78,000명 → 23:00 여유 48,000~50,000명. 중간 21:45~22:05는 촬영 중 컴퓨터가 다시 켜져 수집기가 멈춘 구간 → 12분 넘게 비어 선이 끊김(지어내지 않음).
- 참고: sample 키 때(2026-10-12)는 광화문·덕수궁 11행, 모두 보통 42,000~44,000명.
- 호출량: 수집기는 5분에 121번(서버 5분 저장 안에서는 다시 묻지 않음). 공식 페이지에 이 API 하루 호출 한도는 적혀 있지 않음.

## 근거
- [Vercel Cron Jobs Usage & Pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing)

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 5 = 브랜치 `sec05-crowd`, main 병합 `9e43764`). `solution/`에는 이 수업에서 바뀌거나 생긴 파일만 있습니다.
