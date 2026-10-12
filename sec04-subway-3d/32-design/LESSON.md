# 섹션 4 · 32강 🆕 /design(프리뷰)으로 화면 시안 먼저 — Claude Design 캔버스 → 구현

코드보다 그림 먼저. `/design`으로 PRD를 바탕으로 한 시안 여러 장을 캔버스 하나에 그리고, 직접 열어 확인한 뒤, 고른 시안으로 화면 틀(`subway.html`)을 만듭니다.

## 공식 문서로 확인 (2026-10 기준, research preview)
- `/design [brief]`: 아트보드 여러 장을 캔버스 하나에 그려 Claude Design artifact로 올림(처음엔 비공개, 브라우저에서 편집, PNG·PDF 내보내기)
- 필요: Claude Code v2.1.265 이상, artifacts를 쓸 수 있는 세션, Design 템플릿이 켜진 계정. Bedrock·Google Cloud Agent Platform·Microsoft Foundry·Claude Platform on AWS에서는 쓸 수 없음
- 출처: https://code.claude.com/docs/en/commands , https://code.claude.com/docs/en/artifacts#draft-a-design-canvas

## 입력한 것 (그대로)
```text
/design PRD 보고 지하철 3D 지도 화면 시안 그려 줘
```
→ 약 8분. 보드 4장: 데스크톱(가산디지털단지·낮 창), 수도권 전체 보기(서울역 14시대), 모바일 390px(강남), 답 카드 상태 4종(기본·자정을 넘는 창·동률·기록 없음). 숫자는 9월 원본 CSV에서 하루 평균(÷30)으로 계산. 3D는 미리 보기용 투영 그림.

```text
시안 중에 첫 번째 걸로 화면 틀만 먼저 만들어 줘. 지도 자리는 비워 둬도 돼
```
→ `subway.html`(기존 `index.html`은 그대로). 슬라이더·시간 창 버튼만 동작, 검색·계산·3D는 아직(ROADMAP 2–4단계). 헤드리스 Chrome으로 1440px·375px 확인하며 2곳 수정, `npm test` 통과.

## 결과
- 캔버스: 작성자 계정의 비공개 Claude Design 문서(영상에는 데스크톱·상태 보드 화면)
- `solution/subway.html` — 보기: `python3 -m http.server 8000` → http://127.0.0.1:8000/subway.html

## 팁
- `/design` 뒤에는 짧은 한 줄이면 충분. 저장소에 PRD가 있으면 클로드가 읽고 무엇을 그릴지 정한다
- 시안은 직접 열어서 확인(클로드는 시안 렌더링을 직접 열어 보지 않았다고 밝힘), 예외 상태까지 그림으로
