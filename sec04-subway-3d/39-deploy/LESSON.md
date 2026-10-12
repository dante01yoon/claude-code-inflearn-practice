# 섹션 4 · 39강 배포(Vercel)와 환경 변수·비밀 관리, 🆕 Artifacts로 결과 공유

## 개념
- Vercel = 정적 파일 + 요청 때만 도는 함수 → 37강 프록시를 `api/trains.js` 함수로
- 미리보기(배포마다 새 주소, 기본은 로그인한 팀원만) vs 프로덕션(공개) — 이번엔 미리보기까지
- 키: 로컬 `.env` / 배포 Vercel 환경 변수, 값은 사람이 직접 넣기(`vercel env add`)
- Artifacts: 세션 결과를 claude.ai 페이지로(처음엔 비공개, Share로 공유, Pro·Max·Team·Enterprise)

## 입력한 것 (그대로)
```text
vercel로 미리보기 배포해 줘. 실시간 인증키는 Vercel 환경 변수에서 읽게 하고
```
→ 약 3분 22초. 첫 배포는 Node 서버 프로젝트로 잘못 인식돼 실패(오류 상태, 공개된 것 없음) → `vercel.json`(빌드 없는 정적 사이트) 후 재배포. `realtime-trains.mjs`(로컬 서버·Vercel 함수 공용), `api/trains.js`(키는 환경 변수에서만, CDN 20초 캐시), `.vercelignore`(점 파일·문서·테스트·server.mjs 제외), `.gitignore`(`.vercel`, `.env*`, `!.env.example`). `vercel curl`로 배포 주소 확인: `/api/trains` 정상, `.env`·`.env.local`·`.vercel/`·`.mcp.json`·`server.mjs`·`CLAUDE.md` 404. 클로드는 `.env`를 읽을 수 없어 키 값은 넣지 않음 → 직접: `vercel env add SEOUL_REALTIME_KEY preview`
- 미리보기에는 Vercel 로그인 보호(로그인하지 않은 브라우저는 로그인 화면)
```text
이 배포 결과를 팀에 보여 줄 수 있게 artifact로 소개 페이지 만들어 줘
```
→ 비공개 Artifact 소개 페이지(화면 캡처, 미리보기 주소·열기 버튼, 기능 6가지, 배포 구조 그림, 남은 일, 출처)
```text
커밋해 줘
```
→ `edf3bd0` Vercel 미리보기 배포 설정 추가(실시간 인증키는 Vercel 환경 변수에서)

## 근거 문서
- [Vercel CLI deploy](https://vercel.com/docs/cli/deploy) · [Vercel Deployment Protection](https://vercel.com/docs/deployment-protection) · [Claude Code Artifacts](https://code.claude.com/docs/en/artifacts)
