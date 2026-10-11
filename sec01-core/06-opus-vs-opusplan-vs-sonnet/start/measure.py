"""같은 부탁을 세 가지 모델 설정으로 동시에 맡기고 시간·토큰·비용을 잰다.

방식(세 갈래 모두 같음)
  1단계 계획: claude -p <부탁> --permission-mode plan   (계획 모드: 파일을 고치지 않고 계획만)
  2단계 구현: claude -p "계획대로 만들어 줘" --resume <세션> --permission-mode acceptEdits
  모델만 다르게: opus / opusplan / sonnet. 생각 깊이(effort)는 기본값 그대로.
측정
  시간 = 두 단계를 합친 실제 경과 시간(벽시계)
  토큰·비용 = 마지막 결과 JSON의 modelUsage·total_cost_usd (세션 누적, 모델별)
  ※ total_cost_usd는 Claude Code가 공식 단가표로 계산한 추정치다. 구독 요금제에서는 실제 청구액이 아니다.
사용: python3 measure.py [--reps 1] [--only opus,opusplan,sonnet]
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import threading
import time

HERE = os.path.dirname(os.path.abspath(__file__))
VARIANTS = [("opus", "Opus만"), ("opusplan", "opusplan"), ("sonnet", "Sonnet만")]
CLAUDE = shutil.which("claude") or "claude"
BASE = ["--safe-mode", "--output-format", "json"]  # 개인 설정·스킬·MCP 없이 깨끗한 상태로


def run_variant(model, rep, prompt, st):
    d = os.path.join(HERE, "runs", f"{model}-{rep}")
    shutil.rmtree(d, ignore_errors=True)
    os.makedirs(d)
    t0 = time.time()
    st.update(phase="계획 중", t0=t0)
    p1 = subprocess.run(
        [CLAUDE, "-p", prompt, "--model", model, "--permission-mode", "plan", *BASE],
        cwd=d,
        capture_output=True,
        text=True,
    )
    plan = json.loads(p1.stdout)
    st.update(phase="구현 중", t_plan=time.time() - t0)
    p2 = subprocess.run(
        [
            CLAUDE,
            "-p",
            "계획대로 만들어 줘",
            "--resume",
            plan["session_id"],
            "--model",
            model,
            "--permission-mode",
            "acceptEdits",
            *BASE,
        ],
        cwd=d,
        capture_output=True,
        text=True,
    )
    build = json.loads(p2.stdout)
    wall = time.time() - t0
    mu = build.get("modelUsage", {})
    tok_out = sum(v["outputTokens"] for v in mu.values())
    tok_all = sum(
        v["inputTokens"] + v["cacheReadInputTokens"] + v["cacheCreationInputTokens"] + v["outputTokens"]
        for v in mu.values()
    )
    res = {
        "model": model,
        "rep": rep,
        "wall_s": round(wall, 1),
        "plan_s": round(st["t_plan"], 1),
        "plan_models": sorted(plan.get("modelUsage", {})),
        "models": {
            m: {
                "out": v["outputTokens"],
                "all": v["inputTokens"] + v["cacheReadInputTokens"] + v["cacheCreationInputTokens"] + v["outputTokens"],
                "cost": round(v["costUSD"], 4),
            }
            for m, v in mu.items()
        },
        "tokens_out": tok_out,
        "tokens_all": tok_all,
        "cost_usd": round(build["total_cost_usd"], 4),
        "turns": plan.get("num_turns", 0) + build.get("num_turns", 0),
        "denials": len(build.get("permission_denials", [])),
        "index_bytes": os.path.getsize(os.path.join(d, "index.html"))
        if os.path.exists(os.path.join(d, "index.html"))
        else 0,
        "plan_result": plan.get("result", ""),
        "build_result": build.get("result", ""),
    }
    json.dump(
        {"plan": plan, "build": build}, open(os.path.join(d, "claude-json.json"), "w"), ensure_ascii=False, indent=1
    )
    st.update(phase="완료", wall=wall, res=res)


def pad(text, width):
    """한글은 터미널에서 두 칸을 차지하므로 화면 폭 기준으로 채운다."""
    w = sum(2 if ord(c) > 0x1100 else 1 for c in text)
    return text + " " * max(0, width - w)


def fmt_s(s):
    return f"{int(s // 60)}분 {int(s % 60):02d}초"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reps", type=int, default=1)
    ap.add_argument("--start", type=int, default=1)
    ap.add_argument("--only", default="")
    a = ap.parse_args()
    prompt = open(os.path.join(HERE, "prompt.txt"), encoding="utf-8").read().strip()
    vs = [v for v in VARIANTS if not a.only or v[0] in a.only.split(",")]
    allres = []
    for rep in range(a.start, a.start + a.reps):
        sts = {m: {"phase": "대기", "t0": time.time()} for m, _ in vs}
        ths = [threading.Thread(target=run_variant, args=(m, rep, prompt, sts[m])) for m, _ in vs]
        for th in ths:
            th.start()
        print(f"\n▶ {rep}회차 — 세 갈래 동시에 출발\n")
        first = True
        while any(th.is_alive() for th in ths):
            if not first:
                sys.stdout.write(f"\x1b[{len(vs)}A")
            first = False
            for m, label in vs:
                s = sts[m]
                el = s.get("wall", time.time() - s["t0"])
                icon = "✓" if s["phase"] == "완료" else "…"
                sys.stdout.write(f"\x1b[2K  {icon} {pad(label, 10)} {pad(s['phase'], 7)} {fmt_s(el)}\n")
            sys.stdout.flush()
            time.sleep(0.5)
        sys.stdout.write(f"\x1b[{len(vs)}A")
        for m, label in vs:
            s = sts[m]
            sys.stdout.write(f"\x1b[2K  ✓ {pad(label, 10)} {pad('완료', 7)} {fmt_s(s['wall'])}\n")
        allres += [sts[m]["res"] for m, _ in vs]
    out = os.path.join(HERE, "results.json")
    old = json.load(open(out)) if os.path.exists(out) else []
    old = [r for r in old if (r["model"], r["rep"]) not in {(x["model"], x["rep"]) for x in allres}]
    json.dump(old + allres, open(out, "w"), ensure_ascii=False, indent=1)
    print(
        "\n  "
        + pad("설정", 10)
        + " "
        + pad("시간", 9)
        + "   "
        + pad("출력 토큰", 9)
        + "   "
        + pad("전체 토큰", 9)
        + "   비용(추정)"
    )
    print("  " + "─" * 58)
    for r in allres:
        label = dict(VARIANTS)[r["model"]]
        print(
            f"  {pad(label, 10)} {pad(fmt_s(r['wall_s']), 9)}   {r['tokens_out']:>9,}   {r['tokens_all']:>9,}   ${r['cost_usd']:.2f}"
        )
    print("\n  결과: results.json · 페이지: runs/<설정>-<회차>/index.html")


if __name__ == "__main__":
    main()
