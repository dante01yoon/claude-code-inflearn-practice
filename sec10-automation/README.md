# 섹션 10 · 자동화 — 헤드리스·CI·루틴 (서울 라이브 3D 아침 리포트)

| 폴더 | 내용 |
|---|---|
| [start](start/) | 시작 상태 |
| [73-headless-json](73-headless-json/) | `claude -p`, `--output-format json`, `--json-schema` → 아침 서울 데이터 리포트(`npm run report`) |
| [74-actions-review](74-actions-review/) | GitHub Actions PR 자동 리뷰(claude-code-action), `/code-review --fix`, ultrareview(문서로만) |
| [75-routines](75-routines/) | 루틴 `/schedule`(연구 미리보기): 매일 07:10 KST, 한 번 실행, 끄기 |
| [76-loop](76-loop/) | `/loop` 간격 없이 — 혼잡도 갱신을 지켜보다 알리고 멈추기 |
| [77-mission-10](77-mission-10/) | 미션 10: 리포트에 '가기 좋은 시각' 더하기 + 정답 |

`solution/`에는 그 수업에서 생기거나 바뀐 파일만 있습니다. 비밀값(토큰·키)은 어디에도 없습니다 — GitHub Actions의 `CLAUDE_CODE_OAUTH_TOKEN`은 각자 `claude setup-token`으로 만들어 자기 저장소 secret에 넣으세요.
