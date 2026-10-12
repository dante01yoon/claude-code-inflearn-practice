# 섹션 5 · 47강 관리자 화면

## 개념
- 관리자 화면 = 관제탑: 수집 상태 · API 호출/실패 · 사용자 수.
- 관리자만: 화면에서 숨기기(1겹, 부족) + DB가 문지기(`admin_users` + `admin_dashboard()`가 먼저 확인).

## 입력한 것 (그대로)
```text
관리자 화면 만들어 줘. 수집이 잘 돌고 있는지, 호출 수랑 실패, 사용자 수를 한눈에 보게. 관리자만 들어올 수 있게
커밋해 줘
```
→ 마이그레이션 `20261012120000_admin_dashboard.sql`(admin_users, collect_runs, admin_dashboard()), 수집기가 실행마다 collect_runs에 한 줄, `admin.html`, seed에 admin@example.com. 커밋 `94f1e3d`.
- 권한 시험 중 발견: 촬영에 쓴 로컬 Postgres 이미지(17.6.1.121)에서 실행 권한이 없는 함수를 부르면 DB 프로세스가 재시작됨 → 실행 권한은 두고 함수 안에서 관리자 확인 후 거절하도록 변경. 여러분 환경(최신 CLI·이미지)에서는 안 생길 수 있음.
- 로컬 Supabase는 포트를 0.0.0.0에 열어 둠 — 공용 와이파이 주의.
- 관리자 지정: `insert into public.admin_users (user_id) select id from auth.users where email = '메일';`

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 5 = 브랜치 `sec05-crowd`, main 병합 `9e43764`). `solution/`에는 이 수업에서 바뀌거나 생긴 파일만 있습니다.
