# 112 · [미션] 원본에서 쇼츠 한 편 — HyperFrames로 편집

영상을 멈추고 먼저 해 본 뒤 풀이를 보세요.

## 미션
1. **구간 고르기** — 78초 원본에서 쇼츠로 쓸 30초 이내 구간, 고른 이유까지.
2. **HyperFrames로 편집** — 세로(1080×1920) · 단어 하이라이트 자막 · 키네틱 타이포 훅 · 진행 바.
3. **검수 훅 통과** — 앞 수업의 `.claude`(검수 훅)를 넣어 두고 렌더.

## 준비
```bash
npx hyperframes init hf-short --example blank --non-interactive
cd hf-short
mkdir -p assets && cp ../dante-run/raw.mp4 assets/raw.mp4         # start/dante-run
cp -R ../mograph/.claude .                                         # 앞 수업의 검수 훅(또는 111-render-gate/solution/.claude)
claude
```

## 풀이에서 입력한 것 (그대로)
```text
assets/raw.mp4는 78초짜리 원본이야. 앞에서 배운 HyperFrames로 편집해서, 쇼츠로 쓸 30초 이내 구간을 골라 세로(1080x1920) 쇼츠를 만들어줘. 단어 하이라이트 자막, 키네틱 타이포 훅, 진행 바를 쓰고, 왜 그 구간을 골랐는지 알려줘. 끝나면 out/short.mp4로 렌더해줘. 보고는 한국어로.
```
실제 실행 12분 42초 → `out/short.mp4`(1080×1920, 27.1초, -13.3 LUFS).
- **고른 구간**: 원본 36.8–63.9초, 벽돌에 부딪힘 → 다시 일어남 → 끝까지 성공. 이 안에서 이야기가 끝나고 1.6초 만에 사건이 터짐, 다음 말이 시작되기 직전에 자름, 시작점은 무음이라 말이 잘리지 않음.
- **구성**: 부딪히는 순간 "꽝!"(확대·흔들림·플래시), 말 없는 쓰러짐 6초는 "다시 일어날까?" → 3·2·1 → "두 번째 도전"으로 채움, 마지막에 벽돌·구멍·동전 체크 → "CLEAR!". 진행 바는 코인이 굴러가는 게임 HUD(TRY 1 → TRY 2 → CLEAR).
- **검수 훅이 두 번 막음**: 첫 렌더 -20.6 LUFS(작음) → 고쳤더니 -12.6 LUFS(큼) → 1.5 dB 낮춰 -13.3 LUFS로 통과.
- 처음 받아쓰기가 영어로 번역돼 나와서 말하는 구간마다 한국어로 다시 받아 적어 자막 시각을 맞춤, "역돌" → "벽돌".

완성 프로젝트: [solution/hf-short](solution/hf-short/) (원본 영상 제외 — `start/dante-run/raw.mp4`를 `assets/`에 넣고 `npm run render`). 한글 글꼴 Black Han Sans(OFL) 포함.

프롬프트 원문(복사용): [PROMPTS.md](PROMPTS.md)
