#!/usr/bin/env python3
"""관찰용 훅: 클로드 코드가 한 바퀴 도는 동안 일어난 일을 .claude/trace.log에 한 줄씩 남긴다.

훅 입력(JSON)은 표준 입력으로 들어온다. 아무것도 출력하지 않으므로 클로드의 컨텍스트에는 들어가지 않는다.
"""

import json
import os
import sys
import time

LOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "trace.log")

# 훅 이벤트 → 한 바퀴의 단계
STAGE = {
    "SessionStart": "조립",
    "InstructionsLoaded": "조립",
    "UserPromptSubmit": "요청",
    "PreToolUse": "도구 호출",
    "PermissionRequest": "권한 확인",
    "PermissionDenied": "권한 거절",
    "PostToolUse": "결과",
    "PostToolUseFailure": "결과(실패)",
    "Stop": "답 끝",
    "PreCompact": "압축 시작",
    "PostCompact": "압축 끝",
}


def short(path, cwd):
    """경로를 프로젝트 기준(또는 ~)으로 줄인다."""
    if path.startswith(cwd + "/"):
        return path[len(cwd) + 1 :]
    home = os.path.expanduser("~")
    return path.replace(home, "~", 1)


def detail(e):
    ev, cwd = e.get("hook_event_name", ""), e.get("cwd", "")
    if ev == "InstructionsLoaded":
        return f"{short(e.get('file_path', ''), cwd)} ({e.get('load_reason', '')})"
    if ev == "UserPromptSubmit":
        return e.get("prompt", "")[:40]
    if "tool_name" in e:
        ti = e.get("tool_input") or {}
        arg = ti.get("command") or ti.get("file_path") or ti.get("pattern") or ""
        arg = str(arg).replace(cwd + "/", "")
        text = f"{e['tool_name']} {short(str(arg), cwd)}"
        if e.get("reason"):
            text += f" — {e['reason']}"
        return text[:80]
    if ev in ("PreCompact", "PostCompact"):
        return e.get("trigger", "")
    if ev == "SessionStart":
        return e.get("source", "")
    return ""


def pad(text, width):
    """한글은 두 칸으로 세어 오른쪽을 공백으로 채운다(열 맞춤)."""
    return text + " " * (width - sum(2 if ord(c) > 0x1100 else 1 for c in text))


e = json.load(sys.stdin)
ev = e.get("hook_event_name", "")
line = f"{time.strftime('%H:%M:%S')}  {pad(STAGE.get(ev, ev), 10)}  {ev:<19} {detail(e)}\n"
with open(LOG, "a", encoding="utf-8") as f:
    f.write(line)
