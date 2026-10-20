# 108 · 단어 하이라이트 자막 숏폼 — 단테 런을 세로로

숏폼은 소리를 끄고 보는 사람이 많아서, 말하는 단어만 노랗게 바뀌는 자막을 씁니다. 3부에서 만든 단테 런 영상을 세로로 바꾸고 키네틱 타이포 훅 · 형광펜 · 진행 바를 얹습니다.

시작: 앞 수업의 `mograph` 폴더. 재료는 3부 결과 그대로입니다.
```bash
mkdir -p public/dante
cp ../claude-code-inflearn-practice/sec14-video/106-ending/result/final-ending.mp4 public/dante/
cp ../claude-code-inflearn-practice/sec14-video/104-captions/result/captions.srt public/dante/
claude
```
(경로는 이 저장소를 받은 위치에 맞게 바꾸세요.)

## 실제로 쓴 프롬프트
① 만들기
```text
public/dante의 final-ending.mp4를 세로 숏폼(1080x1920)으로 만들어줘. 영상은 가운데에 두고 captions.srt를 단어 하이라이트 자막으로 넣어줘(말하는 단어만 노란색). 첫 2초에는 키네틱 타이포로 훅 문장 "단테, 이번엔 끝까지 간다"를 띄우고, 중요한 단어는 형광펜으로 강조, 위쪽엔 진행 바. 끝나면 out/dante-short.mp4로 렌더하고, 1초 간격 격자로 자막이 가리거나 잘린 곳이 없는지 확인해줘.
```
실제 실행 14분 26초 → `out/dante-short.mp4`(1080×1920, 38.2초, 소리 포함). 클로드가 격자를 보고 여러 번 고침:
- 원본 영상에 자막이 이미 입혀져 있어 두 번 나오는 것을 찾아냄 → 땅 아래 흙만 있는 아래쪽 20%를 잘라냄.
- 훅 윗부분 잘림, 노란 단어가 커지며 옆 단어와 붙음, 날아오던 "끝까지"가 영상과 잠깐 겹침 → 각각 고침.
- 솔직한 한계: SRT에는 단어별 시각이 없어 글자 수로 나눠 추정 → 노란색이 말보다 조금 빠르거나 늦을 수 있음.

② 한 군데만 짚어 다시 시키기
```text
out/dante-short.mp4에서 노란색 단어가 말보다 조금 빠르거나 늦어. whisper로 단어마다 시각을 받아 적어서 말에 정확히 맞게 고치고, 다시 렌더해줘. 보고는 한국어로.
```
실제 실행 8분 16초. whisper로 단어 시각을 받았는데 기본 단어 경계가 침묵까지 끌어안아서, 파형에서 말이 시작되는 지점에 맞춰 보정(예: "벽돌" whisper 12.6초 → 실제 13.53초). 단어 32개 시각 → [result/words.json](result/words.json). "잘라 / 볼"은 한 단어로 들려 글자 비율로 나눴고, 소리는 사람이 직접 들어 확인해 달라고 남김.

whisper 준비(macOS): `brew install whisper-cpp` 뒤 모델 파일(예: `ggml-small.bin`)을 받아 두면 클로드가 찾아 씁니다. 완성 코드의 `DanteShort`를 그대로 렌더하려면 `result/words.json`을 `public/dante/`에 넣으세요.

팁: 기법은 이름으로 말하기 · 단어 시각이 필요하면 받아 적기로 구하기 · 처음 결과가 아쉬우면 한 군데만 짚어서 다시.

완성 코드: [../107-mograph-gallery/solution/mograph/src/dante](../107-mograph-gallery/solution/mograph/src/dante/)

프롬프트 원문(복사용): [PROMPTS.md](PROMPTS.md)
