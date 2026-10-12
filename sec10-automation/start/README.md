# 섹션 10 시작 상태 — 자동화

## 앱
```bash
git clone https://github.com/dante01yoon/seoul-live-3d.git
cd seoul-live-3d
git checkout e586b13 -b sec10-automation   # 섹션 9까지 끝난 상태(녹화 시작점). 완성본은 main
npm start                                  # http://127.0.0.1:8000
```

## 준비물
- 서울 열린데이터광장 인증키가 없으면 공개 `sample` 키로 동작합니다(도시데이터 1곳, 따릉이 대여소 5곳). 키는 `.env`의 `SEOUL_OPENAPI_KEY`.
- `jq`(74강까지 JSON 꺼내기), `gh`(GitHub CLI, 74강).
- 74강 PR 자동 리뷰: 자기 저장소에 Claude GitHub App 설치 + secret `CLAUDE_CODE_OAUTH_TOKEN`(`claude setup-token`). 워크플로 파일은 **기본 브랜치(main)에 먼저** 있어야 PR에서 실행됩니다.
- 75강 루틴: claude.ai 구독 로그인, claude.ai 계정에 GitHub 연결. 클라우드 기본 네트워크에는 `openapi.seoul.go.kr`이 없어 실시간 API 호출이 막힙니다(환경 설정에서 허용).

## 녹화 환경
Claude Code 2.1.296(2026-10-12), Opus 5.5(루틴은 Sonnet 5.5), VS Code 내장 터미널. 루틴·ultrareview는 연구 미리보기(2026-10 기준).
