# 섹션 10 · 75강 루틴 /schedule (연구 미리보기) — 매일 아침 리포트를 알람처럼

## 이번 수업에서 할 것
- 루틴 = 알람 예약: 정해 둔 시각에 앤트로픽 클라우드에서 클로드가 깨어나, 저장소를 새로 받아, 저장된 프롬프트대로 일함(노트북을 덮어도 됨)
- 만들기 전에: 프롬프트는 혼자 읽어도 되게 자세히 · claude.ai 계정에 GitHub 연결 · 최소 간격 1시간 · 클라우드 환경 네트워크(기본 Trusted 허용 목록) · 실행마다 구독 사용량
- 연습 루틴은 반드시 끄기(CLI에는 삭제 없음 → claude.ai/code/routines에서 삭제)

## 입력한 것 그대로
```text
claude --permission-mode auto
/schedule 매일 아침 7시 10분(한국 시간)에 dante01yoon/seoul-live-3d의 sec10-automation 브랜치에서 npm run report -- --no-claude로 서울 데이터를 받고, 그 숫자로 오늘 아침 요약을 한국어로 써서 마지막 답으로 남겨 줘. 커밋이나 푸시는 하지 마
지금 한 번 돌려 줘
```
(계정 주인이 claude.ai에서 GitHub 연결 — 녹화 안 함)
```text
claude --resume <같은 세션> --permission-mode auto
다시 해 줘
결과 확인해 줘
확인했으니 이 루틴은 꺼 줘
/schedule list
```

## 결과 (2026-10-12 EDT = 10-13 KST, Claude Code 2.1.296)
- 설정안: 이름 「서울 아침 데이터 요약」, 매일 07:10 KST = cron `10 22 * * *`(UTC), Sonnet 5.5, 도구 Bash·Read·Glob·Grep, 커넥터 없음, 프롬프트 초안(숫자 지어내지 않기, sample·실패는 맨 위에, 커밋·푸시·파일 수정 금지). 이 과정에서 계정에 클라우드 환경 Default가 새로 만들어짐.
- 첫 시도: `RemoteTrigger(create)` → **HTTP 401 github_token_missing** "Connect your GitHub account before saving a routine…" → 루틴 저장 안 됨.
- GitHub 연결 뒤: 루틴 생성 + 바로 실행. 만들 때 계정의 claude.ai 커넥터 12개가 자동으로 붙어 클로드가 뗌(필요한 것만 남기기).
- 실행 결과(07:54 KST, 18초): 두 API 호출 모두 **fetch failed** → 데이터 0곳. 원인 = 클라우드 기본 네트워크(Trusted 허용 목록)에 `openapi.seoul.go.kr:8088`이 없음. 고치려면 claude.ai 클라우드 환경에서 해당 도메인 허용(그리고 원하면 `SEOUL_OPENAPI_KEY`). 실행 상태는 "성공"으로 보이지만 결과는 직접 확인해야 함. 실행이 요약을 푸시 알림으로도 보냄(프롬프트에 없던 동작).
- 끄기: `RemoteTrigger(update)` → `enabled: false`, `/schedule list` → 1개, 꺼짐, 다음 실행 없음. 완전 삭제는 claude.ai/code/routines에서.

## 공식 문서 (2026-10-12 확인)
- [루틴으로 작업 자동화하기](https://code.claude.com/docs/ko/routines) — 연구 미리보기, Pro·Max·Team·Enterprise, `/schedule`(별칭 `/routines`), `/schedule list|update|run`, 최소 간격 1시간
- [클라우드 환경 구성](https://code.claude.com/docs/ko/cloud-environments) — Trusted 기본 허용 목록, Custom 도메인 허용

## 근거 데이터
- 서울 실시간 도시데이터·공공자전거 실시간 대여정보 — 서울 열린데이터광장, 서울특별시, 공공누리 1유형(sample 키).
