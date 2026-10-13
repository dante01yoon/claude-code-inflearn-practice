# 22-1강 정답: anatomy 스킬로 만든 그림 두 개 (소스만)

수업에서 녹화 속 클로드(Claude Code v2.1.296, Opus 5.5)가 만든 그림의 **소스**입니다. 빌드에 쓰는 anatomy 키트(`kit/`·`scripts/`)는 이 저장소에 넣지 않았습니다 — 스킬을 직접 설치해서 쓰세요.

- 스킬: https://github.com/wheresryan22/anatomy · 작성자 Ryan(@wheresryan22) · MIT License · 수업에서 설치한 커밋 `be2fa9b`
- 데이터: 서울 열린데이터광장 「서울시 지하철 호선별 역별 시간대별 승하차 인원 정보」 2026년 9월(공공누리 제1유형). 강남(2호선) 행의 한 달 합계 ÷ 30일.

## 다시 만들기
1. 서울 라이브 3D 저장소(https://github.com/dante01yoon/seoul-live-3d) 루트에서 스킬 설치: `npx skills add wheresryan22/anatomy -a claude-code` (Project 선택) → `.claude/skills/anatomy`
2. `figures/` 폴더를 저장소 루트에 복사 (빌드 스크립트가 `../../.claude/skills/anatomy/kit/…`, `../../subway-csv.mjs`, `../../stats.mjs`, `data/raw/` CSV를 씀)
3. 빌드: `node figures/gangnam-gauge/build.mjs` · `node figures/gangnam-gates/build.mjs` (`--light`면 라이트 테마)
4. `npm start` → http://127.0.0.1:8000/figures/gangnam-gates/gangnam-gates.html

| 폴더 | 그림 | 크기 | 걸린 시간 |
|---|---|---|---|
| `figures/gangnam-gauge/` | 강남역 승하차 게이지 (다이얼 게이지 + 막대 24×2) | Figure | 10분 15초 |
| `figures/gangnam-gates/` | 강남역 개찰구 계수기 (회전·분해·WebGL 빛·드럼 계수기) | Hero | 1시간 0분 39초 |

`shots/`는 완성 화면 캡처입니다. 커뮤니티 갤러리에는 게시하지 않았습니다.
