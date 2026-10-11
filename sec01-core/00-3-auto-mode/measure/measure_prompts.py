"""📏 권한 질문이 몇 번 나오나 — 같은 부탁("테스트랑 데이터 검사 돌려 줘")을 세 가지 설정으로 실행해 물어봤을 횟수를 센다.
  manual           : --permission-mode default (= manual), 허용 규칙 없음
  manual + 허용 목록: 위와 같지만 /fewer-permission-prompts가 만든 허용 규칙(allowlist-settings.json)을 --settings로 넣음
                     (claude -p는 한 번도 "이 폴더를 믿는다"고 답하지 않은 폴더의 .claude/settings.json 허용 규칙을 무시하므로 --settings로 전달)
  auto             : --permission-mode auto
claude -p(비대화형)에서는 물어볼 수 없어서, 물어봐야 했던 명령은 거절되고 결과 JSON의 permission_denials에 남는다. 그 개수 = 화면에서였다면 물어봤을 횟수.
사용: python3 measure_prompts.py --start ../start --reps 3   → results.json"""
import argparse
import json
import os
import shutil
import subprocess
import threading
import time

HERE = os.path.dirname(os.path.abspath(__file__))
PROMPT = "테스트랑 데이터 검사 돌려 줘"
BASE = ["claude", "--safe-mode", "--setting-sources", "project,local", "--output-format", "json", "-p", PROMPT]
CONFIGS = {"manual": ("default", False), "manual+allowlist": ("default", True), "auto": ("auto", False)}


def one(name, rep, start, out):
    mode, allow = CONFIGS[name]
    d = os.path.join(out, "runs", f"{name}-{rep}")
    shutil.rmtree(d, ignore_errors=True)
    shutil.copytree(start, d)
    extra = ["--settings", os.path.join(HERE, "allowlist-settings.json")] if allow else []
    t = time.time()
    p = subprocess.run(BASE + ["--permission-mode", mode] + extra, cwd=d, capture_output=True, text=True)
    sec = time.time() - t
    try:
        j = json.loads(p.stdout)
    except json.JSONDecodeError:
        j = {"is_error": True, "result": p.stdout[-300:]}
    den = j.get("permission_denials", [])
    return {"config": name, "rep": rep, "seconds": round(sec, 1), "denials": len(den),
            "denied_commands": [x.get("tool_input", {}).get("command", x.get("tool_name")) for x in den],
            "cost_usd": j.get("total_cost_usd"), "result": (j.get("result") or "")[:400]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", default=os.path.join(HERE, "..", "start"))
    ap.add_argument("--reps", type=int, default=3)
    a = ap.parse_args()
    results = []
    for rep in range(1, a.reps + 1):
        got = {}
        th = [threading.Thread(target=lambda n=n: got.__setitem__(n, one(n, rep, a.start, HERE))) for n in CONFIGS]
        [t.start() for t in th]
        [t.join() for t in th]
        for n in CONFIGS:
            r = got[n]
            results.append(r)
            print(f"{rep}회차 {n}: 물어봤을 횟수 {r['denials']} · {r['seconds']}초 · {r['denied_commands']}", flush=True)
        json.dump(results, open(os.path.join(HERE, "results.json"), "w"), ensure_ascii=False, indent=1)
    print("\n설정 | 평균 물어봤을 횟수 | 평균 시간")
    for n in CONFIGS:
        rs = [x for x in results if x["config"] == n]
        print(f"{n} | {sum(x['denials'] for x in rs) / len(rs):.1f} | {sum(x['seconds'] for x in rs) / len(rs):.0f}초")


if __name__ == "__main__":
    main()
