# [미션] 내 서비스 화면 하나를 하네스로 + 해설 · 실제로 쓴 프롬프트

수업 영상에서 그대로 입력한 원문입니다. 순서대로 입력했어요.

## 1
```text
이름은 seoul-crowd야. 서울 실시간 인구 데이터로 장소별 혼잡도를 보는 앱이고, sample 키로 받아줘. 화면은 두 개면 돼
```

## 2
```text
5번만 고쳐줘. 연령대는 모두 보여줘
```

## 3
```text
승인했어. 이어서 해줘
```

## 직접 실행한 명령
```bash
../design-harness/bin/design-harness check
../design-harness/bin/design-harness approve wireframe --by <이름>
../design-harness/bin/design-harness approve system --by <이름>
```
