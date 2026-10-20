# 하네스 뼈대 — 폴더가 곧 진행 상태 · 실제로 쓴 프롬프트

수업 영상에서 그대로 입력한 원문입니다. 순서대로 입력했어요.

## 1
```text
디자인 작업용 하네스 뼈대를 만들어줘. 단계는 prd → research → ia → wireframe → system → figma → verify → handoff 순서야. work/<프로젝트>/ 폴더에 있는 파일만 보고 npm run check가 단계마다 PASS, FAIL, TODO, WAIT를 보여주면 좋겠어. wireframe, system, verify는 내가 npm run approve로 승인해야 넘어가게 하고, 승인 전에 피그마에 쓰려고 하면 훅으로 막아줘. CLAUDE.md는 짧게.
```

## 2
```text
와이어프레임 승인해줘
```

## 직접 실행한 명령
```bash
npm run new ttareungyi
echo '{"tool_name":"mcp__TalkToFigma__create_frame"}' | node .claude/hooks/guard.mjs; echo "exit $?"
npm run approve wireframe
```
