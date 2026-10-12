# 섹션 9 · 병렬 작업과 Agent Teams — 서울 라이브 3D ③ 따릉이 하루

| 폴더 | 내용 |
|---|---|
| [start](start/) | 시작 상태, 데이터 받는 법(원본은 저장소에 넣지 않음) |
| [68-big-data-worktree](68-big-data-worktree/) | 700MB 대여이력 → 하루 치 + 대여소 좌표를 `claude -w` 두 창으로 동시에, 합치기·정리 |
| [69-agent-teams](69-agent-teams/) | Agent Teams(실험) — 전처리·시각화·검증 팀으로 하루 재생 화면, 원본 CSV 저장소에서 빼기 |
| [70-trips-layer](70-trips-layer/) | deck.gl TripsLayer 빛의 궤적, 개인 속성 없는 재생용 JSON |
| [70-1-combine-layers](70-1-combine-layers/) | 지하철·붐빔·따릉이를 시간 슬라이더 하나로 + 「어디로 무엇을 타고 갈까」 추천 |
| [71-measure-parallel](71-measure-parallel/) | 📏 혼자 vs worktree 병렬 vs Agent Teams 시간·비용(1회씩), `measure/cost.py` |
| [72-mission-9](72-mission-9/) | 미션 9: 평일(6/10) 하루를 더해 토요일과 비교 + 정답 |

재생용 JSON(`data/bike/bike-trips-*.json`)은 앱 저장소에 있습니다. `solution/`에는 그 수업에서 바뀌거나 생긴 코드만 있습니다.
