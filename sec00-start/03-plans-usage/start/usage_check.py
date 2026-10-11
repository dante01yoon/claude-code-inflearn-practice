"""같은 폴더에서 세 가지 부탁을 claude -p로 3번씩 실행하고, 쓴 토큰과 비용(추정)을 표로 보여 준다.

A 짧은 질문 / B 큰 로그 파일을 통째로 읽기 / C 같은 파일에서 필요한 줄만 찾기
비용은 Claude Code가 공식 단가로 계산한 추정치이며, 구독 요금제의 실제 청구액이 아니다.
사용: python3 usage_check.py
"""

import json
import subprocess
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor

TASKS = {
    "A 짧은 질문": "안녕하세요 한 문장으로만 답해 줘.",
    "B 파일 통째로 읽기": "big-log.txt를 처음부터 끝까지 전부 읽고, 어떤 일이 있었는지 세 줄로 요약해 줘.",
    "C 필요한 줄만 찾기": "big-log.txt에서 ERROR가 들어간 줄이 몇 개인지만 세어서 숫자로 알려 줘.",
}
RUNS = 3
TOOLS = ["Read", "Grep", "Glob", "Bash(grep *)", "Bash(wc *)"]


def run(name, prompt):
    cmd = [
        "claude",
        "-p",
        prompt,
        "--safe-mode",
        "--output-format",
        "json",
        "--allowedTools",
        *TOOLS,
    ]
    t0 = time.time()
    out = subprocess.run(cmd, capture_output=True, text=True).stdout
    sec = time.time() - t0
    d = json.loads(out)
    tok_in = tok_out = 0
    for u in (d.get("modelUsage") or {}).values():
        tok_in += (
            u.get("inputTokens", 0)
            + u.get("cacheReadInputTokens", 0)
            + u.get("cacheCreationInputTokens", 0)
        )
        tok_out += u.get("outputTokens", 0)
    return {
        "task": name,
        "sec": round(sec, 1),
        "in": tok_in,
        "out": tok_out,
        "cost": d.get("total_cost_usd", 0),
    }


def pad(s, n, right=False):
    w = sum(2 if unicodedata.east_asian_width(c) in "WF" else 1 for c in s)
    return (" " * (n - w) + s) if right else (s + " " * (n - w))


jobs = [(n, p) for n, p in TASKS.items() for _ in range(RUNS)]
with ThreadPoolExecutor(len(jobs)) as ex:
    rows = list(ex.map(lambda j: run(*j), jobs))
json.dump(rows, open("usage_results.json", "w"), ensure_ascii=False, indent=1)

print(
    "\n"
    + pad("부탁", 22)
    + pad("읽은 토큰", 12, True)
    + pad("쓴 토큰", 10, True)
    + pad("비용(추정)", 13, True)
)
for name in TASKS:
    rs = [r for r in rows if r["task"] == name]
    avg = lambda k: sum(r[k] for r in rs) / len(rs)  # noqa: E731
    print(
        pad(name, 22)
        + pad(f"{avg('in'):,.0f}", 12, True)
        + pad(f"{avg('out'):,.0f}", 10, True)
        + pad(f"${avg('cost'):.3f}", 13, True)
    )
print(f"\n(각 {RUNS}번 평균 · 비용은 공식 단가 추정치, 구독 청구액 아님)")
