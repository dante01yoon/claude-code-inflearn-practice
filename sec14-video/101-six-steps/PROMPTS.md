# 6단계로 나눠 맡기기 · 실제로 쓴 프롬프트

수업 영상에서 그대로 입력한 원문입니다.

## 1단계
```text
inputs/reference.mp4를 보고 왜 잘 되는지 spec.md에 적어줘. 속도, 첫 움직임, 컷 리듬, 글자 등장, 핵심이 나오는 시점. spec.md 하나만 만들어.
```

## 2단계
```text
inputs/race-result.json에서 영상에 쓸 숫자를 data.json에 정리해줘. 숫자마다 출처를 옆에 남겨. data.json 하나만.
```

## 3단계
```text
spec.md, data.json, inputs/README.md를 읽고 15초 세로 영상 story.md를 써줘. 요점 하나, 핵심 숫자 하나, 장면 세 개. inputs에 있는 자료만 쓰고 첫 1초에 결과가 보이게. story.md 하나만.
```

## 4단계
```text
spec.md, data.json, story.md대로 Remotion으로 15초 1080x1920 영상을 src/Scene.tsx에 만들고 Root에 등록해. 숫자는 data.json에서 읽고 타이밍 값은 src/timing.ts에 모아. 렌더는 하지 마.
```

## 내 메모 notes.md
```text
- 5초부터 나오는 요청 원문 글자가 너무 작아. 두 배로 키워줘.
- 10초부터 위 패널(Fable)이 너무 확대돼서 초록 블록만 보여. 확대 전 장면으로 바꿔줘.
- 3.1배 배지가 작아. 더 크게, 나오는 순간 튀어나오게.
```

## 5단계
```text
notes.md의 지시만 반영해. 필요한 값만 바꾸고 렌더는 하지 마.
```

## 6단계
```text
out/final.mp4로 렌더하고, notes.md·data.json·story.md대로 됐는지 프레임으로 확인해서 check.md에 표로 적어줘. 우선순위는 notes.md > story.md > spec.md. 코드는 고치지 말고 보고만 해.
```

## 내 메모 notes.md (한 줄 추가)
```text
- 9.5초부터 이미 초록 블록이 보여. 확대 장면이 아예 안 나오게 해줘.
```

## 5단계 (한 번 더)
```text
notes.md 마지막 줄만 반영해. 렌더는 하지 마.
```
