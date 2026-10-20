# 112 · [미션] 원본에서 쇼츠 한 편 — CapCut · 프리미어로 넘기기

영상을 멈추고 먼저 해 본 뒤 풀이를 보세요.

시작: 같은 `mograph` 폴더(앞 수업의 검수 훅이 들어 있는 상태). 원본은 [start/dante-run/raw.mp4](../start/dante-run/)(78초)를 `public/dante/raw.mp4`로 복사.

## 미션
1. **구간 고르기** — 쇼츠로 쓸 30초 이내 구간, 고른 이유까지.
2. **세로 쇼츠** — 단어 하이라이트 자막 · 키네틱 타이포 훅 · 진행 바, 검수 훅 통과.
3. **넘길 묶음** — 자막 없는 세로 영상 · 자막 파일(srt) · 고른 구간 목록을 `out/handoff/`에.

## 풀이에서 입력한 것 (그대로)
```text
public/dante/raw.mp4는 78초짜리 원본이야. 여기서 쇼츠로 쓸 30초 이내 구간을 골라서 세로(1080x1920) 쇼츠를 만들어줘. 앞에서 쓴 단어 하이라이트 자막, 키네틱 타이포 훅, 진행 바를 쓰고, 왜 그 구간을 골랐는지 알려줘. CapCut이나 프리미어에서 이어서 다듬을 수 있게 out/handoff/에 자막 없는 세로 영상, 자막 파일(srt), 고른 구간 목록도 같이 넣어줘. 보고는 한국어로.
```
실제 실행 19분 2초 → `out/dante-raw-short.mp4`(1080×1920, 23.2초, -14.4 LUFS).
- 고른 흐름: 실패하고 다시 해서 성공하는 네 구간(원본 22.8–26.9 · 36.0–41.0 · 47.5–48.5 · 50.0–63.2초). 인사·대기, 배경 설명(넣으면 충돌이 10초 뒤로 밀림), 다음 수업 안내는 이유와 함께 뺌 → [result/segments.csv](result/segments.csv)
- 훅 문구 "단테, 벽돌을 넘을까?". 기존 자막은 편집본 기준이라 원본을 다시 받아 적고 파형으로 단어 경계 보정. 추임새 2곳은 소리는 두고 자막에서만 뺌.
- 스스로 고친 곳: "구멍도 넘었어요" 자막이 0.95초만 보여 구간 끝을 0.3초 늘려 다시 렌더. 완성본과 자막 없는 영상 둘 다 검수 훅 통과.
- 음량은 렌더 결과 -16.3 LUFS인데 피크가 -0.4 dB라 그냥 키우지 못해 2패스 loudnorm(-14 LUFS, True Peak -1 dB).

## 넘길 묶음 → [result/](result/)
- `dante-raw-short-clean.mp4` 자막·훅·진행 바 없는 세로 영상(소리·길이는 완성본과 같음) · `dante-raw-short.srt` 자막 10개 · `segments.csv` 구간 목록 · `dante-raw-short.edl`(요청에 없던 추가, 프리미어용) · `README.md`
- **CapCut 데스크톱**: 자막 메뉴에서 SRT 가져오기를 지원합니다([공식 도움말](https://www.capcut.com/help/how-to-import-subtitles)). EDL은 읽지 못하니 구간은 CSV 참고(클로드 보고).
- **프리미어 프로**: SRT를 가져와 캡션 트랙으로, EDL은 가져온 뒤 `raw.mp4`에 다시 연결하면 가로 원본으로 같은 컷이 됩니다(클로드 보고). 이 수업에서 두 프로그램으로 직접 가져오는 장면은 녹화하지 않았습니다.

완성 코드: [../107-mograph-gallery/solution/mograph](../107-mograph-gallery/solution/mograph/) (`src/dante/DanteRawShort.tsx`, `rawCut.json`, `scripts/dante-handoff.mts`)

프롬프트 원문(복사용): [PROMPTS.md](PROMPTS.md)
