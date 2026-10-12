"""📏 40강 — 검증을 시킬 때 vs 안 시킬 때, 같은 기능을 claude -p로 3번씩 만들고 같은 채점기(7개 항목)로 버그 수를 센다.
사용: python3 measure/measure_verify.py [반복 수=3]
- 시작 상태: 36강 커밋(c81f7f0)을 git archive로 풀어 매번 새 폴더에서 시작
- A(검증 안 시킴) = 기능 부탁만, B(검증 시킴) = 같은 부탁 + "브라우저로 직접 열어서 확인하고 고쳐 줘"
- 채점: measure/check40.mjs (Playwright 계열 헤드리스 브라우저로 #top5를 7개 항목 검사), 정답 순위는 9월 CSV에서 따로 계산한 expected.json
- 결과: measure/results.json, 표는 화면에 출력"""
import json
import os
import shutil
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
BASE_COMMIT = "c81f7f0"  # 36강 커밋 (녹화 당시 해시 216d83b, 저장소 정리 후 c81f7f0)
N = int(sys.argv[1]) if len(sys.argv) > 1 else 3
RUNS = os.path.join("/private/tmp", "m40-runs")
TASK = ("역 검색창 아래에 '지금 시간대 혼잡 TOP 5' 목록을 추가해 줘. 슬라이더 시간대에서 승차+하차가 가장 많은 역 5곳을 순위대로 보여 주고, "
        "하나를 누르면 그 역이 선택되게. 목록 요소 id는 top5로.")
VERIFY = " 다 만들면 브라우저로 직접 열어서 동작을 확인하고, 문제가 있으면 고쳐 줘."
CLAUDE = shutil.which("claude") or "claude"


def run(variant, i, port):
    wd = os.path.join(RUNS, f"{variant}{i}")
    shutil.rmtree(wd, ignore_errors=True)
    os.makedirs(wd)
    subprocess.run(f"git -C '{REPO}' archive {BASE_COMMIT} | tar -x -C '{wd}'", shell=True, check=True)
    subprocess.run(["git", "init", "-q"], cwd=wd)
    subprocess.run(["git", "add", "-A"], cwd=wd)
    subprocess.run(["git", "-c", "user.name=m40", "-c", "user.email=m40@example.invalid", "commit", "-qm", "base"], cwd=wd)
    prompt = TASK + (VERIFY if variant == "B" else "")
    t0 = time.time()
    p = subprocess.run([CLAUDE, "-p", prompt, "--output-format", "json", "--permission-mode", "auto"], cwd=wd, capture_output=True, text=True, timeout=3600)
    wall = time.time() - t0
    try:
        j = json.loads(p.stdout)
    except Exception:
        j = {"is_error": True, "result": p.stdout[-300:] + p.stderr[-300:]}
    srv = subprocess.Popen(["python3", "-m", "http.server", str(port), "--bind", "127.0.0.1"], cwd=wd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.5)
    out = os.path.join(wd, "check.json")
    subprocess.run(["hypit", "capture", "run", os.path.join(HERE, "check40.mjs"), "--", f"http://127.0.0.1:{port}/subway.html",
                    os.path.join(HERE, "expected.json"), out], cwd=HERE, capture_output=True, text=True, timeout=600)
    srv.terminate()
    chk = json.load(open(out)) if os.path.exists(out) else {"bugs": 7, "checks": {}}
    r = {"variant": variant, "run": i, "seconds": round(wall, 1), "cost_usd": round(j.get("total_cost_usd") or 0, 3),
         "turns": j.get("num_turns"), "bugs": chk["bugs"], "failed": [k for k, v in chk.get("checks", {}).items() if not v["pass"]]}
    print(f"{variant}{i}  {'검증 시킴' if variant == 'B' else '검증 안 시킴'}  {r['seconds']:6.0f}초  ${r['cost_usd']:.2f}  버그 {r['bugs']}개  {' '.join(r['failed'])}", flush=True)
    return r


if __name__ == "__main__":
    os.makedirs(RUNS, exist_ok=True)
    print(f"같은 부탁을 A(검증 안 시킴)·B(검증 시킴) {N}번씩, 둘씩 동시에 실행합니다. 채점 항목 7개.", flush=True)
    results = []
    with ThreadPoolExecutor(max_workers=2) as ex:
        for i in range(1, N + 1):
            fa = ex.submit(run, "A", i, 18310 + i)
            fb = ex.submit(run, "B", i, 18320 + i)
            results += [fa.result(), fb.result()]
    json.dump(results, open(os.path.join(HERE, "results.json"), "w"), ensure_ascii=False, indent=1)
    print("\n            평균 시간   평균 비용   평균 버그(7개 중)")
    for v, name in (("A", "검증 안 시킴"), ("B", "검증 시킴  ")):
        rs = [r for r in results if r["variant"] == v]
        print(f"{name}   {sum(r['seconds'] for r in rs) / len(rs):6.0f}초   ${sum(r['cost_usd'] for r in rs) / len(rs):6.2f}   {sum(r['bugs'] for r in rs) / len(rs):4.1f}개")
