# 섹션 9 · 68강 큰 데이터 나누기 — 한 달 700MB에서 하루 치를 worktree로 동시에

## 오늘 할 것
따릉이 대여이력 한 달 치(2026년 6월, 700MB·418만 줄)에서 6월 13일(토) 하루 치를 뽑는 일과, 대여소 번호별 위도·경도를 정리하는 일을 **두 클로드에게 동시에** 맡깁니다. 각자 자기 worktree(작업대 사본)에서 일하고, 끝나면 합칩니다.

## 개념 — worktree = 작업대를 복사해 여러 명이 동시에
- `claude -w <이름>`(= `--worktree`) → 저장소 안 `.claude/worktrees/<이름>/`에 파일 한 벌, 브랜치 `worktree-<이름>`. 깃 기록(.git)은 원래 저장소와 함께 씀.
- 다른 터미널에서 다른 이름으로 한 번 더 실행하면 두 번째 세션. `.claude/worktrees/`는 `.gitignore`에.
- 나갈 때 고친 파일·새 커밋이 있으면 **Keep worktree / Remove worktree**를 물음(기본 Keep).
- 나누면 좋을 때: 서로 기다리지 않는 일, 고치는 파일이 다른 일. 피할 때: 같은 파일을 둘이 고침, 앞 일이 끝나야 뒤 일.

## 데이터 (실제 파일)
- [서울시 공공자전거 대여이력 정보(OA-15182)](https://data.seoul.go.kr/dataList/OA-15182/F/1/datasetView.do) `서울특별시 공공자전거 대여이력 정보_2606.csv`(716MB, CP949, 공공누리 1유형). 열: 자전거번호·대여일시·대여 대여소번호·대여 대여소명·대여거치대·반납일시·반납대여소번호·반납대여소명·반납거치대·이용시간(분)·이용거리(M)·생년·성별·이용자종류·대여대여소ID·반납대여소ID. **좌표 없음.**
- [서울시 공공자전거 따릉이 대여소 정보(OA-13252)](https://data.seoul.go.kr/dataList/OA-13252/F/1/datasetView.do) `공공자전거 대여소 정보(26.6월 기준).xlsx`(머리글 여러 줄, 대여소번호·위도·경도 등, 공공누리 1유형).
- 두 파일은 저장소에 넣지 않습니다. 직접 받아 `~/seoul-data/따릉이/`에 두세요.

## 실습 (입력한 것 그대로)
```bash
ls -lh ~/seoul-data/따릉이
echo ".claude/worktrees/" >> .gitignore && git commit -qam "worktree 폴더는 git에서 빼기"
claude -w bike-trips --permission-mode auto      # 왼쪽 터미널
```
```text
~/seoul-data/따릉이에 받아 둔 6월 따릉이 대여이력에서 6월 13일(토) 하루 치만 뽑아서 data/bike에 저장하고 커밋해 줘. 나중에 지도에서 이동을 재생할 거야
```
```bash
claude -w bike-stations --permission-mode auto   # 터미널 나누기(오른쪽)
```
```text
~/seoul-data/따릉이의 대여소 정보 엑셀에서 대여소 번호별 위도·경도를 뽑아 data/bike에 JSON으로 저장하고 커밋해 줘
```
두 창이 서로 권한 질문을 기다리지 않도록 auto 모드(섹션 1)로 켰습니다.

결과(녹화 1회): 왼쪽 1분 28초 — CP949라 grep이 비어 바이트 그대로 거르는 Node 스크립트로 바꿈, 하루 135,181건 CSV(커밋 dd119bd(영상 속 2a26a4d), 브랜치 `worktree-bike-trips`. 클로드 답에는 "sec09-bike 브랜치"라고 잘못 나옴). 오른쪽 1분 14초 — 2,789곳 `station-coords-202606.json`(df0b749, 테스트 73개 통과).

합치기:
```bash
git worktree list
claude
```
```text
worktree 두 개에서 한 작업을 지금 브랜치에 합치고, worktree는 정리해 줘
```
→ README.md 충돌(두 쪽이 같은 자리에 출처 절을 넣음)을 두 절 모두 남기며 해결, 테스트 73개, 잠금 확인 후 worktree·브랜치 삭제(ac8ef4a, f3c6ceb(영상 속 2eda80e)).

⚠️ 하루 치 원본 CSV에는 생년·성별 열이 있어 공개 저장소에는 넣지 않습니다(69·70강에서 재생용 JSON으로 바꾸고 이력에서도 뺌).

## 근거
- 공식 문서 [Run parallel sessions with worktrees](https://code.claude.com/docs/en/worktrees) (2026-10-12 확인, Claude Code 2.1.296)


## 앱 저장소
[dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) 브랜치 `sec09-bike` → main 로컬 머지 `e586b13`. 공개 전에 하루 치 원본 CSV(생년·성별 열 포함)를 `git filter-branch`로 sec09-bike 이력에서 지워서, 원본 CSV가 든 커밋은 해시가 바뀌었습니다(괄호 안이 영상에 보이는 해시).
