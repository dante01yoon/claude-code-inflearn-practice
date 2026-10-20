# 핸드오프와 재사용 · 실제로 쓴 프롬프트

수업 영상에서 그대로 입력한 원문입니다. 순서대로 입력했어요.

## 1
```text
이 하네스를 다른 프로젝트에서도 /design-flow로 바로 시작할 수 있게 묶어줘
```

## 2
```text
npm run handoff가 에러 나. 고쳐줘
```

## 3
```text
/design-flow
```

## 4
```text
HANDOFF.md 화면 이름이 undefined로 나와. 고쳐줘
```

## 직접 실행한 명령
```bash
npm run handoff && head -36 work/ttareungyi/HANDOFF.md
mkdir ../new-app && cd ../new-app && claude --plugin-dir ../design-harness
```
