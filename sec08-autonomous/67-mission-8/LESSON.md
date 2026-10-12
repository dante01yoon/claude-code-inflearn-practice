# 섹션 8 · 67강 미션 8 — 백그라운드 /goal로 피크 이름표 겹침 고치기

> agent view(백그라운드 세션)는 research preview입니다(2026-10 기준).

## 미션
63강에서 본 두 역 비교 그래프의 피크 이름표 겹침을, **백그라운드 세션에 `/goal`을 걸어** 고치세요. 조건에는 끝 상태 · 확인 방법 · 지킬 것 · 턴 제한. 보낸 뒤 agent view로 엿보고, 끝나면 들어가서 `/goal` 상태 확인 → 워크트리 브랜치를 내 브랜치로 합치고 → 앱에서 확인.

## 채점표
1. `claude --bg`로 보냈다 2. 조건에 끝 상태 · 확인 · 지킬 것 · 턴 제한 3. agent view에서 끝난 것을 확인 4. `/goal` 상태가 Goal achieved 5. 내 브랜치로 합치고 `npm test` 통과 6. 앱에서 이름표가 떨어져 보인다
힌트: 슬래시 명령도 `claude --bg`의 할 일 자리에 그대로 넣을 수 있습니다. Remote Control을 켜 두면 휴대폰에서도 지켜볼 수 있습니다.

## 정답 풀이 (입력한 것 그대로)
```bash
claude --bg --name peak-labels "/goal 두 역 비교 그래프에서 두 역 피크 이름표가 서로 겹치지 않는다. 확인: npm test 통과, 헤드리스 브라우저로 강남과 홍대입구 비교 화면을 찍어 이름표 두 개가 떨어져 보이는지 본다. 지킬 것: 기존 테스트 파일은 고치지 않는다. 끝나면 커밋한다. 10턴 안에 못 하면 멈춘다."
claude agents     # Space 엿보기 → Completed 되면 Enter
```
```text
/goal             # ✔ Goal achieved · 3m · 1 turn · 17.2k tokens
```
```bash
git merge --ff-only worktree-compare-peak-labels
npm test          # tests 91 · pass 91
```
- 결과: 약 3분 30초, 브랜치 `worktree-compare-peak-labels`에 커밋 `3c0e836`(`placePeakLabels` — 글자 폭 · 위쪽 끝을 반영해 자리 고르기, 새 테스트 `tests/station-compare-labels.test.mjs`). 헤드리스 화면으로 세 번 다듬음.
- 클로드가 스스로 남긴 아쉬운 점: 「강남」 이름표가 파란 점 바로 옆이라 색 없이 보면 헷갈릴 수 있음(다음 개선 거리). 워크트리가 처음엔 main 기준으로 만들어져 sec08-auto 위로 맞춤.
- You should know 노트: "커밋은 지금 쓰시는 sec08-auto 브랜치가 아니라 별도 작업 공간의 새 브랜치에…" → 합치기를 잊지 않게.

## 결과 화면
http://127.0.0.1:8000/subway.html?compare=강남,홍대입구 → 「홍대입구」는 파란 점 왼쪽 위, 「강남」은 그 오른쪽으로 떨어짐.


---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 8 = 브랜치 `sec08-auto`, 이 수업 커밋 `3c0e836`).
