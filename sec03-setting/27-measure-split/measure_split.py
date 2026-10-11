"""📏 서브에이전트로 나눴을 때 vs 혼자 할 때 — 같은 점검 작업을 claude -p로 번갈아 3번씩 실행해 시간·토큰·비용·찾은 문제 수를 잰다.
사용: python3 measure_split.py [반복 횟수=3]   (결과: results.json, 표 출력)
- 매 실행마다 setting/ 폴더를 임시 폴더로 복사해서 실행 (서로 영향 없음)
- 혼자: 서브에이전트 금지 / 나눔: 파일 묶음마다 reviewer 서브에이전트
- 시간은 실행 전체를 잰 벽시계 시간(result의 duration_ms는 서브에이전트가 일한 시간이 빠질 수 있어 따로 기록)
- 토큰·비용은 마지막 result 줄의 modelUsage(서브에이전트 포함), 메인 대화 몫은 usage(맨 위 대화만)"""
import json, os, re, shutil, subprocess, sys, tempfile, time

N = int(sys.argv[1]) if len(sys.argv) > 1 else 3
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "setting")
CLAUDE = shutil.which("claude") or "claude"
TASK = ("이 폴더 .claude 안의 세팅을 점검해 줘. 대상: skills/web-page, skills/seoul-data, agents/reviewer.md, hooks 스크립트 두 개, "
        "skills/project-counts(mod). 파일은 고치지 말고 문제만 찾아. 마지막에 문제마다 한 줄씩 '- [높음|중간|낮음] 파일: 내용' 형식으로 적어.")
MODES = {
    "혼자": TASK + " 서브에이전트는 쓰지 말고 직접 읽어서 해.",
    "나눔": TASK + " 대상 묶음마다 reviewer 서브에이전트를 하나씩 띄워서 나눠 맡기고, 결과만 모아서 정리해.",
}


def run(mode):
    wd = tempfile.mkdtemp(prefix="m27-")
    shutil.copytree(SRC, os.path.join(wd, "s"))
    wd = os.path.join(wd, "s")
    t0 = time.time()
    p = subprocess.run([CLAUDE, "-p", MODES[mode], "--output-format", "stream-json", "--verbose",
                        "--allowedTools", "Read,Grep,Glob,Agent,Task"] + (["--model", os.environ["MODEL"]] if os.environ.get("MODEL") else []), cwd=wd, capture_output=True, text=True, timeout=1800)
    wall = time.time() - t0
    agents, result = 0, None
    for line in p.stdout.splitlines():
        try:
            d = json.loads(line)
        except Exception:
            continue
        if d.get("type") == "assistant" and d.get("parent_tool_use_id") is None:
            for c in d.get("message", {}).get("content", []):
                if c.get("type") == "tool_use" and c.get("name") in ("Agent", "Task"):
                    agents += 1
        if d.get("type") == "result":
            result = d
    shutil.rmtree(os.path.dirname(wd), ignore_errors=True)
    if not result:
        return {"mode": mode, "error": p.stderr[-500:]}
    mu = result.get("modelUsage", {})
    tot = sum(v.get("inputTokens", 0) + v.get("outputTokens", 0) + v.get("cacheReadInputTokens", 0) + v.get("cacheCreationInputTokens", 0) for v in mu.values())
    u = result.get("usage", {})
    main = u.get("input_tokens", 0) + u.get("output_tokens", 0) + u.get("cache_read_input_tokens", 0) + u.get("cache_creation_input_tokens", 0)
    text = result.get("result", "")
    found = len(re.findall(r"^\s*-\s*\[(높음|중간|낮음)\]", text, re.M))
    return {"mode": mode, "seconds": round(wall, 1), "reported_seconds": round(result.get("duration_ms", 0) / 1000, 1), "cost_usd": round(result.get("total_cost_usd", 0), 3),
            "total_tokens": tot, "main_tokens": main, "subagents": agents, "found": found,
            "models": {k: round(v.get("costUSD", 0), 3) for k, v in mu.items()}, "result": text}


rows = []
for i in range(N):
    for mode in (("혼자", "나눔") if i % 2 == 0 else ("나눔", "혼자")):
        r = run(mode)
        rows.append(r)
        print(f"[{i + 1}/{N}] {mode}: {r.get('seconds')}초 · ${r.get('cost_usd')} · 전체 {r.get('total_tokens', 0):,} 토큰 · 메인 {r.get('main_tokens', 0):,} · 서브에이전트 {r.get('subagents')}개 · 찾은 문제 {r.get('found')}개", flush=True)
json.dump(rows, open(os.path.join(HERE, "results.json"), "w"), ensure_ascii=False, indent=1)
print("\n평균 (" + str(N) + "회)")
print(f"{'':6} {'시간':>8} {'비용':>8} {'전체 토큰':>12} {'메인 토큰':>12} {'찾은 문제':>8}")
for mode in ("혼자", "나눔"):
    rs = [r for r in rows if r["mode"] == mode and "error" not in r]
    avg = lambda k: sum(r[k] for r in rs) / len(rs)
    print(f"{mode:6} {avg('seconds'):>7.0f}초 {avg('cost_usd'):>7.2f}$ {avg('total_tokens'):>12,.0f} {avg('main_tokens'):>12,.0f} {avg('found'):>8.1f}")
