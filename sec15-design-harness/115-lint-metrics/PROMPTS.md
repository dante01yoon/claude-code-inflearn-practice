# 검증 ① 린트와 객관 지표 · 실제로 쓴 프롬프트

수업 영상에서 그대로 입력한 원문입니다. 순서대로 입력했어요.

## 1
```text
린트 경고 12개가 진짜 디자인 문제인지 봐줘
```

## 2
```text
응, 그렇게 고치고 테스트도 남겨줘
```

## 직접 실행한 명령
```bash
npm run lint:figma -- --nodes tests/fixtures/bad-nodes.json
npm run lint:figma
npm run metrics -- work/ttareungyi
claude --continue
npm test
npm run lint:figma
```
