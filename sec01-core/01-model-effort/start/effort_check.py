"""같은 퍼즐을 생각 깊이(effort) low·medium·high·max로 3번씩 동시에 풀게 하고, 시간·생각 토큰·정답 여부를 표로 보여 준다.
측정: claude -p ... --effort <수준> --output-format json 결과의 duration_ms, modelUsage(thinkingTokens·outputTokens), total_cost_usd.
total_cost_usd는 Claude Code가 공식 단가로 계산한 추정치(구독 요금제의 실제 청구액 아님).
사용: python3 effort_check.py [--reps 3] [--model opus]"""

import argparse
import json
import shutil
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor

Q = (
    "민수, 지영, 철호, 수아, 태민 다섯 명이 한 줄로 섰다. 지영은 민수 바로 뒤에 있다. 철호는 맨 앞도 맨 뒤도 아니다. "
    "수아는 태민보다 앞에 있지만 바로 앞은 아니다. 민수는 세 번째가 아니다. 태민은 맨 뒤가 아니다. "
    "앞에서부터 순서를 마지막 줄에 '이름, 이름, 이름, 이름, 이름' 형식으로만 답해 줘."
)
ANSWER = ["수아", "철호", "태민", "민수", "지영"]
LEVELS = ["low", "medium", "high", "max"]
CLAUDE = shutil.which("claude") or "claude"


def pad(t, w):
    return t + " " * max(0, w - sum(2 if ord(c) > 0x1100 else 1 for c in t))


def one(level, model):
    t0 = time.time()
    r = subprocess.run(
        [CLAUDE, "-p", Q, "--model", model, "--effort", level, "--safe-mode", "--output-format", "json"],
        capture_output=True,
        text=True,
    )
    d = json.loads(r.stdout)
    mu = list(d["modelUsage"].values())[0]
    last = [ln for ln in d["result"].strip().splitlines() if ln.strip()][-1]
    names = [n.strip(" .*`'\"") for n in last.replace("→", ",").split(",")]
    return {
        "level": level,
        "sec": time.time() - t0,
        "think": mu.get("thinkingTokens", 0),
        "out": mu["outputTokens"],
        "cost": d["total_cost_usd"],
        "ok": names == ANSWER,
        "last": last,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reps", type=int, default=3)
    ap.add_argument("--model", default="opus")
    a = ap.parse_args()
    jobs = [lv for lv in LEVELS for _ in range(a.reps)]
    print(f"같은 퍼즐 × 생각 깊이 {len(LEVELS)}단계 × {a.reps}번 = {len(jobs)}번 동시에 실행 중…", flush=True)
    t0 = time.time()
    with ThreadPoolExecutor(len(jobs)) as ex:
        futs = [ex.submit(one, lv, a.model) for lv in jobs]
        while not all(f.done() for f in futs):
            sys.stdout.write(f"\r  끝난 실행 {sum(f.done() for f in futs)}/{len(jobs)} · {time.time() - t0:.0f}초")
            sys.stdout.flush()
            time.sleep(0.5)
    res = [f.result() for f in futs]
    sys.stdout.write(f"\r  끝난 실행 {len(jobs)}/{len(jobs)} · {time.time() - t0:.0f}초\n\n")
    print(
        "  "
        + pad("생각 깊이", 10)
        + pad("평균 시간", 11)
        + pad("생각 토큰", 11)
        + pad("출력 토큰", 11)
        + pad("정답", 7)
        + "비용(추정)"
    )
    print("  " + "─" * 60)
    for lv in LEVELS:
        rs = [r for r in res if r["level"] == lv]
        n = len(rs)
        print(
            "  "
            + pad(lv, 10)
            + pad(f"{sum(r['sec'] for r in rs) / n:.1f}초", 11)
            + pad(f"{sum(r['think'] for r in rs) / n:,.0f}", 11)
            + pad(f"{sum(r['out'] for r in rs) / n:,.0f}", 11)
            + pad(f"{sum(r['ok'] for r in rs)}/{n}", 7)
            + f"${sum(r['cost'] for r in rs) / n:.3f}"
        )
    json.dump(res, open("effort_results.json", "w"), ensure_ascii=False, indent=1)
    print("\n  (평균값 · 모델", a.model, "· 결과: effort_results.json)")


if __name__ == "__main__":
    main()
