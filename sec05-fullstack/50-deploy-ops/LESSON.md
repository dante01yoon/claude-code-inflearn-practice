# 섹션 5 · 50강 배포와 운영 점검

## 개념
- 로컬 vs 배포: 요청 받는 곳(server.mjs → Vercel 함수), 비밀값(.env → Vercel 환경 변수), DB(로컬 Supabase → 배포엔 없음).
- 운영 점검 4가지: 응답 · 막혀야 할 파일 · 키 노출 · 함수 로그.

## 입력한 것 (그대로)
```text
vercel 미리보기로 배포해 줘. 배포한 곳에는 아직 Supabase가 없으니 그 기능은 꺼진 채로 안내만 보이게 하고, 배포한 다음 운영 점검도 해 줘
커밋해 줘
```
→ DB 없음이면 503 `{ error, disabled: true }` + 안내만(다시 시도 버튼 없음). `.vercelignore`에 `node_modules/`(supabase CLI 150MB)와 `supabase/`(테스트 사용자 든 seed.sql) 추가 — 그대로였다면 공개 파일로 올라갈 뻔. 미리보기 배포 Ready, 점검: 화면·모듈 200, `/api/trains`·`/api/citydata` 200(sample 키), `/api/config`·`/api/crowd-history` 503+안내, `.env`·seed·node_modules·tests 등 404, 응답에 키 없음, 함수 로그 오류 없음. 커밋 `dfa1141`.
- 미리보기 배포는 Vercel 로그인 보호(팀 계정만 열람). 클라우드 Supabase를 붙이면 `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` 환경 변수만 넣고 다시 배포.

## 근거
- [Vercel Deployment Protection](https://vercel.com/docs/deployment-protection)

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 5 = 브랜치 `sec05-crowd`, main 병합 `9e43764`). `solution/`에는 이 수업에서 바뀌거나 생긴 파일만 있습니다.
