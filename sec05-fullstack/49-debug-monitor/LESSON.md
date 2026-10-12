# 섹션 5 · 49강 오류 디버깅 — 로그·재현·되돌리기, 🆕 Monitor 도구

## 개념
- 디버깅 순서: 증상 → 로그 → 재현 → 원인 → 고치기 → 확인. 되돌리기는 `/rewind`(대화·코드 지점) 또는 git.
- Monitor 도구: 백그라운드에서 로그·상태를 지켜보다 이벤트가 오면 클로드가 끼어듦. 기본 5분, 최대 30분.

## 입력한 것 (그대로)
```text
개발 서버를 8000번에 띄우고, 서버 로그를 Monitor로 지켜봐 줘. 오류가 보이면 바로 알려 줘
```
→ (강사가 옆에서 `docker stop supabase_db_seoul-live-3d` + 그래프 요청 3번) → Monitor event `crowd_snapshots 읽기 실패 HTTP 503` → 클로드가 컨테이너·로그를 보고 증상/원인/영향 보고.
```text
원인이랑 재현 방법을 정리하고, DB가 꺼져도 화면에는 친절한 안내가 보이게 고쳐 줘
DB 다시 켰어. 정상으로 돌아왔는지 로그로 확인해 줘
커밋해 줘
/rewind
```
→ `db-status.mjs`, 서버 503 + 안내 문구(로그는 한 줄), 화면 '다시 시도' 버튼, 관리자 화면 1분마다 재확인, 테스트 65개. DB를 켜고 약 20초 뒤 정상. 커밋 `a3d3f53`.

## 근거
- [Claude Code Tools reference · Monitor tool](https://code.claude.com/docs/en/tools-reference#monitor-tool)

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 5 = 브랜치 `sec05-crowd`, main 병합 `9e43764`). `solution/`에는 이 수업에서 바뀌거나 생긴 파일만 있습니다.
