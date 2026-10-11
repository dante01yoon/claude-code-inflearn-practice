"""MCP 서버가 대화 시작 때 컨텍스트를 얼마나 쓰는지 세 가지 설정으로 재 보기.
`claude -p /context` 결과에서 전체 토큰과 MCP 도구 몫을 읽어 표로 보여 줍니다. (모델 호출 없이 계산만 하므로 사용량이 거의 들지 않습니다)
사용: 이 폴더(.mcp.json이 있는 곳)에서  python3 mcp_context_check.py"""
import os
import re
import subprocess
import unicodedata

RUNS = [
    ("MCP 끔", ["--strict-mcp-config"], {}),
    ("MCP 켬 · 기본(도구 검색 켜짐)", [], {}),
    ("MCP 켬 · 도구 검색 끔", [], {"ENABLE_TOOL_SEARCH": "false"}),
]


def k(s):
    s = s.strip().lower()
    return float(s[:-1]) * 1000 if s.endswith("k") else float(s)


def measure(args, env):
    out = subprocess.run(["claude", "-p", "/context", *args], capture_output=True, text=True,
                         env={**os.environ, **env}, timeout=180).stdout
    total = re.search(r"\*\*Tokens:\*\*\s*([\d.]+k?)\s*/", out)
    mcp_now = re.search(r"\|\s*MCP tools\s*\|\s*([\d.]+k?)", out)
    mcp_def = re.search(r"\|\s*MCP tools \(deferred\)\s*\|\s*([\d.]+k?)", out)
    return (k(total.group(1)) if total else None, k(mcp_now.group(1)) if mcp_now else 0, k(mcp_def.group(1)) if mcp_def else 0)


def pad(s, n, right=False):
    w = sum(2 if unicodedata.east_asian_width(c) in "WF" else 1 for c in s)
    return (" " * (n - w) + s) if right else (s + " " * (n - w))


COLS = [("설정", 30), ("시작 토큰", 12), ("MCP 도구 · 바로 올림", 22), ("MCP 도구 · 필요할 때", 22)]
print("".join(pad(c, n, i > 0) for i, (c, n) in enumerate(COLS)))
for name, args, env in RUNS:
    total, now, deferred = measure(args, env)
    vals = [name, f"{total:,.0f}", f"{now:,.0f}", f"{deferred:,.0f}"]
    print("".join(pad(v, n, i > 0) for i, (v, (_, n)) in enumerate(zip(vals, COLS))))
