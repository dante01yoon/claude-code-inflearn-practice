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
```
```bash
npm run collect -- --watch
```
촬영 때 쌓인 기록: sample 키 광화문·덕수궁 11행(2026-10-12 14:05~15:15 KST, 모두 보통 42,000~44,000명).

## 근거
- [Vercel Cron Jobs Usage & Pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing)

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 5 = 브랜치 `sec05-crowd`, main 병합 `9e43764`). `solution/`에는 이 수업에서 바뀌거나 생긴 파일만 있습니다.
