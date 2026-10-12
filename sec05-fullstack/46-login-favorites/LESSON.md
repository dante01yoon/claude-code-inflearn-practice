# 섹션 5 · 46강 로그인과 사용자별 데이터: 즐겨찾기·붐빔 알림

## 개념
- 로그인 → 명찰(JWT) → 요청마다 명찰 → RLS가 본인 줄만. 그래서 publishable 키가 브라우저에 있어도 안전.

## 입력한 것 (그대로)
```text
로그인 붙여 줘. 로그인하면 장소랑 내 역을 즐겨찾기하고, 즐겨찾기한 곳이 붐비면 알려 주게. 알림 기준은 사용자가 고르게
로컬에서 시험할 테스트 사용자 두 명도 seed로 만들어 줘
커밋해 줘
```
클로드가 먼저 물은 3가지(모두 추천안 선택): 알림 방식(페이지가 열려 있을 때) · 로그인 방식(이메일 6자리 코드) · 역 기준(실시간 인원이 없어 9월 승하차 통계에서 '지금 시간대가 피크의 N% 이상').
→ 마이그레이션 `20261012090000_favorite_alerts.sql`(notify_level, favorite_stations, RLS), `alerts.mjs`+테스트, `/api/config`(주소와 publishable 키만), 화면(로그인·즐겨찾기·알림). 테스트 59개. seed: `supabase/seed.sql`(tester1·tester2@example.com, 로컬 시험용). 모은 기록이 지워지지 않게 `db reset` 대신 seed만 직접 실행. 커밋 `d65e88e`, `bbfcfb5`, `e29ac1e`.
- 로컬 로그인 코드는 Mailpit(http://127.0.0.1:54424)에서 확인.

## 근거
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 5 = 브랜치 `sec05-crowd`, main 병합 `9e43764`). `solution/`에는 이 수업에서 바뀌거나 생긴 파일만 있습니다.
