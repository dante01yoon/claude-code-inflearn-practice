"""📏 계획 모드를 쓸 때 vs 안 쓸 때 — 같은 부탁(prompt.txt)을 같은 시작 폴더에서 두 방법으로 실행해 시간·비용·토큰·결과 점검을 잰다.
  바로: claude -p <부탁> --permission-mode auto
  계획: claude -p <부탁> --permission-mode plan  →  claude -p "계획대로 만들어 줘" --resume <세션> --permission-mode auto
두 방법은 동시에 돌리고, --reps번 반복한다. 결과: results.json (+ runs/<방법>-<회차>/ 에 결과 폴더와 점검 화면)
사용: python3 measure_plan.py --start ../start --reps 3
비용(total_cost_usd)은 Claude Code가 공식 단가로 계산한 추정치이며 구독 요금제의 실제 청구액이 아니다.
점검: node check_page.cjs (npm i puppeteer 필요), 화면 차이 계산에 Pillow 필요."""
import argparse
import json
import os
import shutil
import subprocess
import sys
import threading
import time

from PIL import Image, ImageChops, ImageStat

HERE = os.path.dirname(os.path.abspath(__file__))
PROMPT = open(os.path.join(HERE, "prompt.txt"), encoding="utf-8").read().strip()
BASE = ["claude", "--safe-mode", "--setting-sources", "project,local", "--output-format", "json"]  # CLAUDE.md·스킬·플러그인·훅 없이 같은 조건


def run(cmd, cwd):
    t = time.time()
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    try:
        j = json.loads(p.stdout)
    except json.JSONDecodeError:
        j = {"is_error": True, "raw": p.stdout[-500:], "stderr": p.stderr[-500:]}
    return time.time() - t, j


def arm(name, rep, start, out):
    d = os.path.join(out, "runs", f"{name}-{rep}")
    shutil.rmtree(d, ignore_errors=True)
    shutil.copytree(start, d)
    res = {"method": name, "rep": rep}
    if name == "direct":
        sec, j = run(BASE + ["-p", PROMPT, "--permission-mode", "auto"], d)
        res.update(seconds=sec, final=j)
    else:
        sec1, j1 = run(BASE + ["-p", PROMPT, "--permission-mode", "plan"], d)
        sec2, j2 = run(BASE + ["-p", "계획대로 만들어 줘", "--resume", j1.get("session_id", ""), "--permission-mode", "auto"], d)
        res.update(seconds=sec1 + sec2, plan_seconds=sec1, plan=j1, final=j2)
    f = res["final"]
    mu = f.get("modelUsage", {})  # --resume 호출의 modelUsage·total_cost_usd는 세션 누적
    res["cost_usd"] = f.get("total_cost_usd")
    res["output_tokens"] = sum(v.get("outputTokens", 0) for v in mu.values())
    res["turns"] = f.get("num_turns")
    res["denials"] = len(f.get("permission_denials", []))
    return res


def check(rep_dir, port):
    srv = subprocess.Popen([sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1"], cwd=rep_dir,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.2)
    out = os.path.join(rep_dir, "_check", "check.json")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    subprocess.run(["node", os.path.join(HERE, "check_page.cjs"), f"http://127.0.0.1:{port}/", out], capture_output=True, text=True)
    srv.terminate()
    c = json.load(open(out)) if os.path.exists(out) else {"no_errors": False, "has_slider": False, "keeps_old": False}
    a, b = os.path.join(rep_dir, "_check", "h08.png"), os.path.join(rep_dir, "_check", "h18.png")
    if os.path.exists(a) and os.path.exists(b):
        ia, ib = Image.open(a).convert("L"), Image.open(b).convert("L")
        diff = ImageStat.Stat(ImageChops.difference(ia, ib)).mean[0]
        c["slider_diff"] = round(diff, 2)
        c["slider_changes_3d"] = diff > 0.5
    else:
        c["slider_changes_3d"] = False
    c["score"] = sum(bool(c.get(k)) for k in ("no_errors", "has_slider", "slider_changes_3d", "keeps_old"))
    return c


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", default=os.path.join(HERE, "..", "start"))
    ap.add_argument("--reps", type=int, default=3)
    ap.add_argument("--first", type=int, default=1)
    ap.add_argument("--out", default=HERE)
    a = ap.parse_args()
    path = os.path.join(a.out, "results.json")
    results = json.load(open(path)) if os.path.exists(path) else []
    for rep in range(a.first, a.first + a.reps):
        got = {}
        th = [threading.Thread(target=lambda n=n: got.__setitem__(n, arm(n, rep, a.start, a.out))) for n in ("direct", "plan")]
        [t.start() for t in th]
        [t.join() for t in th]
        for k, n in enumerate(("direct", "plan")):
            r = got[n]
            r["check"] = check(os.path.join(a.out, "runs", f"{n}-{rep}"), 18100 + k)
            results = [x for x in results if not (x["method"] == n and x["rep"] == rep)] + [r]
            print(f"{rep}회차 {'바로' if n == 'direct' else '계획'}: {r['seconds']:.0f}초 · ${r['cost_usd'] or 0:.3f} · 출력 {r['output_tokens']:,} 토큰 · 점검 {r['check']['score']}/4", flush=True)
        json.dump(results, open(path, "w"), ensure_ascii=False, indent=1)
    print("\n방법 | 평균 시간 | 평균 비용(추정) | 평균 출력 토큰 | 점검 평균")
    for n, label in (("direct", "바로 구현"), ("plan", "계획 → 구현")):
        rs = [x for x in results if x["method"] == n]
        if rs:
            avg = lambda k: sum((x[k] or 0) for x in rs) / len(rs)  # noqa: E731
            sc = sum(x["check"]["score"] for x in rs) / len(rs)
            print(f"{label} | {avg('seconds'):.0f}초 | ${avg('cost_usd'):.3f} | {avg('output_tokens'):,.0f} | {sc:.1f}/4  ({len(rs)}회)")


if __name__ == "__main__":
    main()
