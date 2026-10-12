"""📏 51강: 같은 일을 생각 깊이(effort)만 바꿔 맡기고 시간·비용·품질(숨은 테스트 10개)을 잰다.
사용: python3 measure_effort.py [회차=1] [모델=sonnet]   결과: results.json + 표"""
import json, os, shutil, subprocess, sys, tempfile, time
HERE = os.path.dirname(os.path.abspath(__file__))
N = int(sys.argv[1]) if len(sys.argv) > 1 else 1
MODEL = sys.argv[2] if len(sys.argv) > 2 else "sonnet"
LEVELS = ["low", "medium", "high", "xhigh", "max"]
PROMPT = open(os.path.join(HERE, "prompt.txt"), encoding="utf-8").read().strip()
out = os.path.join(HERE, "results.json")
res = json.load(open(out)) if os.path.exists(out) else []
for n in range(1, N + 1):
    for lv in LEVELS:
        if any(r["effort"] == lv and r["run"] == n for r in res):
            continue
        d = tempfile.mkdtemp(prefix=f"effort-{lv}-{n}-")
        shutil.copytree(os.path.join(HERE, "fixture"), d, dirs_exist_ok=True)
        t0 = time.time()
        p = subprocess.run(["claude", "-p", PROMPT, "--model", MODEL, "--effort", lv, "--output-format", "json",
                            "--permission-mode", "acceptEdits", "--allowedTools", "Bash(node *)", "Bash(npm test*)"],
                           cwd=d, capture_output=True, text=True)
        wall = round(time.time() - t0, 1)
        try:
            j = json.loads(p.stdout)
        except Exception:
            j = {}
        g = subprocess.run(["node", "--test", "--test-reporter=tap", os.path.join(HERE, "grader", "grade.test.mjs")], env={**os.environ, "TARGET": d}, capture_output=True, text=True)
        passed = sum(1 for l in g.stdout.splitlines() if l.startswith("# pass")) and int([l for l in g.stdout.splitlines() if l.startswith("# pass")][0].split()[-1])
        own = [f for f in os.listdir(d) if "test" in f] + ([f for f in os.listdir(os.path.join(d, "tests"))] if os.path.isdir(os.path.join(d, "tests")) else [])
        u = j.get("usage", {})
        r = {"effort": lv, "run": n, "seconds": wall, "cost_usd": round(j.get("total_cost_usd", 0), 3), "output_tokens": u.get("output_tokens"),
             "turns": j.get("num_turns"), "hidden_tests_passed": passed, "own_test_files": len(own), "dir": os.path.basename(d)}
        res.append(r)
        json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
        print(f"{lv:7s} #{n}  {wall:6.1f}s  ${r['cost_usd']:.3f}  숨은 테스트 {passed}/10  자체 테스트 파일 {len(own)}", flush=True)
print()
print(f"{'effort':8s}{'시간(초)':>10s}{'비용($)':>10s}{'숨은 테스트':>12s}{'자체 테스트':>12s}")
for lv in LEVELS:
    rs = [r for r in res if r["effort"] == lv]
    if not rs:
        continue
    a = lambda k: sum(r[k] for r in rs) / len(rs)  # noqa: E731
    print(f"{lv:8s}{a('seconds'):10.1f}{a('cost_usd'):10.3f}{a('hidden_tests_passed'):10.1f}/10{a('own_test_files'):10.1f}")
