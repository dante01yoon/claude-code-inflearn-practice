"""📏 40강 두 번째 실험 — 화면에서만 드러나는 기능: 3D 지도 위 TOP 5 역 이름(한글 라벨). 검증 시킬 때 vs 안 시킬 때 3번씩.
사용: python3 measure/measure_verify.py [반복 수=3]
- 시작 상태: 36강 커밋(c81f7f0)을 git archive로 풀어 매번 새 폴더에서 시작
- A(검증 안 시킴) = 기능 부탁만, B(검증 시킴) = 같은 부탁 + "브라우저로 직접 열어서 확인하고 고쳐 줘"
- 채점: measure/check40b.mjs(08시·18시 스크린샷, JS 오류, 375px) + measure/ocr40.py(지도 영역 글자 인식으로 TOP 5 이름이 읽히는지) — 4개 항목
- 결과: measure/results2.json, 표는 화면에 출력"""
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
RUNS = os.path.join("/private/tmp", "m40-runs2")
TASK = "subway.html의 3D 지도 기둥 위에 지금 시간대에 승차+하차가 가장 많은 역 5곳의 이름을 띄워 줘. 슬라이더를 움직이면 바뀌게."
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
    subprocess.run(["hypit", "capture", "run", os.path.join(HERE, "check40b.mjs"), "--", f"http://127.0.0.1:{port}/subway.html", wd],
                   cwd=HERE, capture_output=True, text=True, timeout=600)
    srv.terminate()
    subprocess.run(["uvx", "--with", "pyobjc-framework-Vision", "--with", "pillow", "python", os.path.join(HERE, "ocr40.py"), wd, os.path.join(HERE, "expected.json")],
                   cwd=HERE, capture_output=True, text=True, timeout=600)
    out = os.path.join(wd, "check2.json")
    chk = json.load(open(out)) if os.path.exists(out) else {"bugs": 4, "checks": {}}
    r = {"variant": variant, "run": i, "seconds": round(wall, 1), "cost_usd": round(j.get("total_cost_usd") or 0, 3),
         "turns": j.get("num_turns"), "bugs": chk["bugs"], "failed": [k for k, v in chk.get("checks", {}).items() if not v["pass"]]}
    print(f"{variant}{i}  {'검증 시킴' if variant == 'B' else '검증 안 시킴'}  {r['seconds']:6.0f}초  ${r['cost_usd']:.2f}  버그 {r['bugs']}개  {' '.join(r['failed'])}", flush=True)
    return r


if __name__ == "__main__":
    os.makedirs(RUNS, exist_ok=True)
    print(f"같은 부탁을 A(검증 안 시킴)·B(검증 시킴) {N}번씩, 둘씩 동시에 실행합니다. 채점 항목 4개.", flush=True)
    results = []
    with ThreadPoolExecutor(max_workers=2) as ex:
        for i in range(1, N + 1):
            fa = ex.submit(run, "A", i, 18340 + i)
            fb = ex.submit(run, "B", i, 18350 + i)
            results += [fa.result(), fb.result()]
    json.dump(results, open(os.path.join(HERE, "results2.json"), "w"), ensure_ascii=False, indent=1)
    print("\n            평균 시간   평균 비용   평균 버그(4개 중)")
    for v, name in (("A", "검증 안 시킴"), ("B", "검증 시킴  ")):
        rs = [r for r in results if r["variant"] == v]
        print(f"{name}   {sum(r['seconds'] for r in rs) / len(rs):6.0f}초   ${sum(r['cost_usd'] for r in rs) / len(rs):6.2f}   {sum(r['bugs'] for r in rs) / len(rs):4.1f}개")
