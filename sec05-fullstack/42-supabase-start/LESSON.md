# 섹션 5 · 42강 Supabase 시작: DB·인증 구조

## 개념
- DB = 앱의 기억(즐겨찾기, 5분마다 붐빔 기록). 서울시 실시간 API는 '지금'만 주고 지난 기록은 주지 않는다.
- 인증 = 문 앞 명찰(JWT). 줄마다 누가 볼 수 있는지 정하는 규칙 = RLS(행 수준 보안, 46강).
- Supabase = Postgres + Auth + 자동 API(PostgREST) + Realtime + Studio, 앱은 Project URL 하나로 들어간다.
- 키 두 가지: publishable(브라우저 OK, RLS가 지킴) / secret(규칙을 건너뜀, 서버에만).
- 로컬(계정 없이, 도커만) vs 클라우드(계정, 배포용). 이번 섹션은 로컬.

## 입력한 것 (그대로)
```bash
npm install supabase@2.101.0 --save-dev   # 강의 화면과 버전을 맞춤. 최신 버전을 써도 됩니다.
npx supabase --version
```
```text
이 앱에 supabase 붙이려고 해. 로컬로 시작해 줘
지금 로컬에 뭐가 떠 있는지, 각각 어디에 쓰는 건지 짧게 정리해 줘
커밋해 줘
```
→ `npx supabase init` → 첫 `start`는 다른 로컬 프로젝트가 기본 포트(5432x)를 쓰고 있어 실패 → 이 프로젝트 포트만 5442x로 옮김, Auth 돌아올 주소를 8000번으로. 커밋 `391c10c`.
- Studio http://127.0.0.1:54423 · API http://127.0.0.1:54421 · Mailpit http://127.0.0.1:54424
- 끄기·켜기: `npx supabase stop` / `npx supabase start` (끄더라도 데이터는 남음)

## 촬영 환경 메모
- 촬영 컴퓨터는 도커 이미지 받기가 막혀 있어 받아 둔 이미지에 맞는 CLI 2.101.0을 쓰고, 이 앱이 쓰지 않는 Storage·Edge Functions를 꺼 두었습니다(`SUPABASE_STORAGE_ENABLED=false`, `SUPABASE_EDGE_RUNTIME_ENABLED=false`). 그래서 영상에서 storage 컨테이너가 없다고 나옵니다. 여러분 환경에서는 그대로 `npx supabase start` 하면 됩니다.
- 화면의 publishable·secret 키는 로컬 개발용 공용 기본값입니다. 클라우드 프로젝트 키는 화면·코드에 올리지 마세요.

## 근거
- [Supabase Local Development & CLI](https://supabase.com/docs/guides/local-development)

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 5 = 브랜치 `sec05-crowd`, main 병합 `9e43764`). `solution/`에는 이 수업에서 바뀌거나 생긴 파일만 있습니다.
