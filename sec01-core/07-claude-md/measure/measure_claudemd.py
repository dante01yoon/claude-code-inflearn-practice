"""📏 CLAUDE.md가 있을 때 vs 없을 때 — 같은 부탁("역마다 오늘의 요약 카드를 추가해 줘")을 두 조건에서 실행하고, 규칙을 지켰는지 자동으로 센다.
  없음: 시작 폴더 그대로
  있음: 시작 폴더 + 수업에서 만든 규칙 파일(rules/CLAUDE.md, rules/data/CLAUDE.md, rules/.claude/rules/html.md)
점검 5가지: ① 1호선 공식 색 #0052A4 사용 ② 숫자 서식 toLocaleString("ko-KR") ③ 새로 생긴 aria-label 없는 버튼이 없음(원래 있던 버튼은 빼고 셈) ④ 원본 데이터 파일 그대로 ⑤ 대답이 한국어
사용: python3 measure_claudemd.py --start ../start --reps 3   → results.json"""
import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import threading
import time

HERE = os.path.dirname(os.path.abspath(__file__))
PROMPT = "역마다 오늘의 요약 카드를 추가해 줘"
BASE = ["claude", "--setting-sources", "project,local", "--strict-mcp-config", "--permission-mode", "auto", "--output-format", "json", "-p", PROMPT]
DATA = os.path.join("data", "subway-hourly-202607.json")


def sha(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()


def unlabeled(html):
    return sum("aria-label" not in b for b in re.findall(r"<button\b[^>]*>", html)) + len(re.findall(r"createElement\(\s*['\"]button['\"]\s*\)", html))


def check(d, before, result, start_html):
    html = open(os.path.join(d, "index.html"), encoding="utf-8").read()
    hangul = len(re.findall(r"[가-힣]", result))
    latin = len(re.findall(r"[A-Za-z]", result))
    c = {
        "line_color": "#0052a4" in html.lower(),
        "ko_locale": "ko-KR" in html,
        "aria_label": unlabeled(html) <= unlabeled(start_html),
        "data_untouched": sha(os.path.join(d, DATA)) == before,
        "korean_reply": hangul > latin,
    }
    c["score"] = sum(c.values())
    return c


def one(cond, rep, start, out):
    d = os.path.join(out, "runs", f"{cond}-{rep}")
    shutil.rmtree(d, ignore_errors=True)
    shutil.copytree(start, d)
    if cond == "with":
        shutil.copytree(os.path.join(HERE, "rules"), d, dirs_exist_ok=True)
    before = sha(os.path.join(d, DATA))
    start_html = open(os.path.join(start, "index.html"), encoding="utf-8").read()
    t = time.time()
    p = subprocess.run(BASE, cwd=d, capture_output=True, text=True)
    sec = time.time() - t
    try:
        j = json.loads(p.stdout)
    except json.JSONDecodeError:
        j = {"result": p.stdout[-300:]}
    res = j.get("result") or ""
    return {"cond": cond, "rep": rep, "seconds": round(sec, 1), "cost_usd": j.get("total_cost_usd"),
            "check": check(d, before, res, start_html), "result": res[:500]}


def rescore(start):
    """이미 돌린 runs/를 다시 채점 (점검 규칙을 고쳤을 때)"""
    path = os.path.join(HERE, "results.json")
    results = json.load(open(path))
    start_html = open(os.path.join(start, "index.html"), encoding="utf-8").read()
    before = sha(os.path.join(start, DATA))
    for r in results:
        r["check"] = check(os.path.join(HERE, "runs", f"{r['cond']}-{r['rep']}"), before, r["result"], start_html)
    json.dump(results, open(path, "w"), ensure_ascii=False, indent=1)
    return results


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", default=os.path.join(HERE, "..", "start"))
    ap.add_argument("--reps", type=int, default=3)
    ap.add_argument("--rescore", action="store_true")
    a = ap.parse_args()
    results = rescore(a.start) if a.rescore else []
    for rep in range(1, 0 if a.rescore else a.reps + 1):
        got = {}
        th = [threading.Thread(target=lambda c=c: got.__setitem__(c, one(c, rep, a.start, HERE))) for c in ("without", "with")]
        [t.start() for t in th]
        [t.join() for t in th]
        for c in ("without", "with"):
            r = got[c]
            results.append(r)
            print(f"{rep}회차 CLAUDE.md {'없음' if c == 'without' else '있음'}: {r['check']['score']}/5 {r['check']} · {r['seconds']}초", flush=True)
        json.dump(results, open(os.path.join(HERE, "results.json"), "w"), ensure_ascii=False, indent=1)
    print("\n조건 | 평균 점수 | 항목별 지킨 횟수")
    for c in ("without", "with"):
        rs = [x for x in results if x["cond"] == c]
        keys = ["line_color", "ko_locale", "aria_label", "data_untouched", "korean_reply"]
        print(c, f"{sum(x['check']['score'] for x in rs) / len(rs):.1f}/5", {k: sum(x["check"][k] for x in rs) for k in keys})


if __name__ == "__main__":
    main()
