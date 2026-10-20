#!/usr/bin/env python3
"""out/ 아래에 새로 생긴 mp4를 검사하는 Claude Code 훅.

훅 모드 (stdin으로 훅 JSON을 받음, PostToolUse:Bash / Stop 에서 호출):
  새 mp4나 바뀐 mp4만 검사한다. 기준 미달이면 stderr에 문제를 적고 exit 2 →
  Claude가 그 내용을 받아서 고친다. 같은 파일(같은 mtime·크기)은 한 번만 보고한다.

수동 모드:
  check-video.py out/a.mp4 ...   지정한 파일을 바로 검사
  check-video.py --baseline      지금 out/에 있는 mp4를 '이미 본 것'으로 기록
"""
import json
import math
import os
import re
import subprocess
import sys
import time

PROJECT = os.environ.get("CLAUDE_PROJECT_DIR") or os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
OUT = os.path.join(PROJECT, "out")
CHECK = os.path.join(OUT, "check")
STATE = os.path.join(CHECK, ".state.json")
CONFIG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "video-check.json")


def load_json(path, default):
    try:
        with open(path) as f:
            return json.load(f)
    except (OSError, ValueError):
        return default


def save_state(state):
    os.makedirs(CHECK, exist_ok=True)
    tmp = STATE + ".tmp"
    with open(tmp, "w") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
    os.replace(tmp, STATE)


def find_videos():
    found = []
    for root, dirs, files in os.walk(OUT):
        dirs[:] = [d for d in dirs if os.path.join(root, d) != CHECK]
        for name in files:
            if name.lower().endswith(".mp4"):
                found.append(os.path.join(root, name))
    return sorted(found)


def signature(path):
    st = os.stat(path)
    return {"mtime": st.st_mtime, "size": st.st_size}


def rel(path):
    return os.path.relpath(path, PROJECT)


def probe(path):
    """렌더 중이라 moov가 아직 없으면 None."""
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path],
        capture_output=True, text=True,
    )
    if r.returncode != 0:
        return None
    data = json.loads(r.stdout)
    video = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), None)
    if video is None or "duration" not in data.get("format", {}):
        return None
    audio = next((s for s in data["streams"] if s.get("codec_type") == "audio"), None)
    return {
        "width": int(video["width"]),
        "height": int(video["height"]),
        "fps": video.get("r_frame_rate"),
        "duration": float(data["format"]["duration"]),
        "has_audio": audio is not None,
    }


def analyze(path, info, cfg):
    """한 번 디코딩으로 검은 구간과 통합 음량을 함께 잰다."""
    black = "blackdetect=d={}:pix_th={}:pic_th={}".format(
        cfg["black_max_seconds"], cfg["black_pixel_threshold"], cfg["black_picture_ratio"]
    )
    cmd = ["ffmpeg", "-hide_banner", "-nostats", "-i", path]
    if info["has_audio"]:
        cmd += ["-filter_complex", "[0:v:0]{}[v];[0:a:0]ebur128=framelog=quiet[a]".format(black),
                "-map", "[v]", "-map", "[a]"]
    else:
        cmd += ["-map", "0:v:0", "-vf", black]
    cmd += ["-f", "null", "-"]
    log = subprocess.run(cmd, capture_output=True, text=True).stderr

    blacks = [
        {"start": float(a), "end": float(b), "duration": float(c)}
        for a, b, c in re.findall(
            r"black_start:\s*([\d.]+)\s+black_end:\s*([\d.]+)\s+black_duration:\s*([\d.]+)", log
        )
    ]
    lufs = None
    if info["has_audio"]:
        summary = log[log.rfind("Summary:"):]
        m = re.search(r"I:\s+(-?[\d.]+|-inf)\s+LUFS", summary)
        if m:
            lufs = -math.inf if m.group(1) == "-inf" else float(m.group(1))
    return blacks, lufs


def make_grid(path, info, cfg):
    """1초에 한 장씩 뽑아 cols x rows 격자로 붙인다. 칸 번호 = 초 (왼→오, 위→아래)."""
    base = os.path.splitext(os.path.basename(path))[0]
    for old in os.listdir(CHECK):
        if old.startswith(base + ".grid-") and old.endswith(".jpg"):
            os.remove(os.path.join(CHECK, old))
    seconds = max(1, math.ceil(info["duration"]))
    per_sheet = cfg["grid_columns"] * cfg["grid_rows"]
    cols = min(cfg["grid_columns"], seconds)
    out = []
    for i, first in enumerate(range(0, seconds, per_sheet)):
        count = min(per_sheet, seconds - first)
        name = os.path.join(CHECK, "{}.grid-{:02d}.jpg".format(base, i + 1))
        subprocess.run(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
             "-ss", str(first), "-t", str(per_sheet), "-i", path,
             "-vf", "fps=1,scale={}:-2,tile={}x{}:padding=4:margin=4:color=0x808080".format(
                 cfg["grid_tile_width"], cols, math.ceil(count / cols)),
             "-frames:v", "1", "-q:v", "3", name],
            capture_output=True,
        )
        if os.path.exists(name):
            out.append({"file": rel(name), "seconds": "{}–{}s".format(first, first + count - 1)})
    return out, cols


def check(path, cfg):
    info = probe(path)
    if info is None:
        return None
    os.makedirs(CHECK, exist_ok=True)
    blacks, lufs = analyze(path, info, cfg)
    grids, cols = make_grid(path, info, cfg)

    problems = []
    if (info["width"], info["height"]) != (cfg["width"], cfg["height"]):
        problems.append("해상도 {}x{} (기준 {}x{}) → Composition의 width/height와 렌더 --scale 옵션 확인".format(
            info["width"], info["height"], cfg["width"], cfg["height"]))
    d = info["duration"]
    if not cfg["min_duration_seconds"] <= d <= cfg["max_duration_seconds"]:
        problems.append("길이 {:.2f}s (기준 {}–{}s) → durationInFrames / --frames 범위 확인".format(
            d, cfg["min_duration_seconds"], cfg["max_duration_seconds"]))

    silent = lufs is not None and lufs <= cfg["silence_lufs"]
    if lufs is not None and not silent:
        lo = cfg["lufs_target"] - cfg["lufs_tolerance"]
        hi = cfg["lufs_target"] + cfg["lufs_tolerance"]
        if not lo <= lufs <= hi:
            gain = cfg["lufs_target"] - lufs
            problems.append(
                "음량 {:.1f} LUFS (기준 {} ±{} LUFS, {:+.1f} dB 필요) → 소스의 <Audio volume>을 "
                "조정해 다시 렌더하거나, 렌더 결과에 ffmpeg -af loudnorm=I={}:TP=-1:LRA=11 -c:v copy 적용".format(
                    lufs, cfg["lufs_target"], cfg["lufs_tolerance"], gain, cfg["lufs_target"]))

    long_blacks = [b for b in blacks if b["duration"] > cfg["black_max_seconds"]]
    for b in long_blacks:
        problems.append("검은 화면 {:.2f}s–{:.2f}s ({:.2f}s, 기준 {}s 이하) → 해당 구간 장면/페이드/에셋 로딩 확인".format(
            b["start"], b["end"], b["duration"], cfg["black_max_seconds"]))

    report = {
        "file": rel(path),
        "checked_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "width": info["width"], "height": info["height"], "fps": info["fps"],
        "duration": round(d, 3),
        "audio": "없음" if not info["has_audio"] else ("무음" if silent else "있음"),
        "integrated_lufs": None if lufs is None or math.isinf(lufs) else round(lufs, 1),
        "black_segments": long_blacks,
        "grids": grids,
        "grid_columns": cols,
        "ok": not problems,
        "problems": problems,
    }
    base = os.path.splitext(os.path.basename(path))[0]
    with open(os.path.join(CHECK, base + ".json"), "w") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    return report


def describe(r):
    audio = r["audio"] if r["integrated_lufs"] is None else "{} LUFS".format(r["integrated_lufs"])
    head = "{}: {}x{} {}fps {:.2f}s, 오디오 {}".format(
        r["file"], r["width"], r["height"], r["fps"], r["duration"], audio)
    lines = [("✅ " if r["ok"] else "❌ ") + head]
    lines += ["   - " + p for p in r["problems"]]
    for g in r["grids"]:
        lines.append("   격자({}칸/줄, 1칸=1초 {}): {}".format(r["grid_columns"], g["seconds"], g["file"]))
    return "\n".join(lines)


def run_hook(event):
    cfg = load_json(CONFIG, {})
    state = load_json(STATE, {})
    state = {k: v for k, v in state.items() if os.path.exists(os.path.join(PROJECT, k))}
    reports = []
    for path in find_videos():
        key = rel(path)
        sig = signature(path)
        prev = state.get(key)
        if prev and prev.get("mtime") == sig["mtime"] and prev.get("size") == sig["size"]:
            continue
        r = check(path, cfg)
        if r is None:  # 아직 렌더 중 — 다음 호출에서 다시 본다
            continue
        if signature(path) != sig:  # 검사 도중 바뀜
            continue
        state[key] = dict(sig, ok=r["ok"], problems=r["problems"])
        reports.append(r)
    save_state(state)

    if not reports:
        return 0
    failed = [r for r in reports if not r["ok"]]
    text = "\n".join(describe(r) for r in reports)
    if not failed:
        # 통과는 Claude에게 조용히 알려 주기만 한다.
        print(json.dumps({"hookSpecificOutput": {
            "hookEventName": event, "additionalContext": "[영상 검사 통과]\n" + text,
        }} if event == "PostToolUse" else {"systemMessage": "[영상 검사 통과]\n" + text},
            ensure_ascii=False))
        return 0
    sys.stderr.write(
        "[영상 검사 실패] 렌더된 영상이 기준에 못 미칩니다. 아래 문제를 고치고 다시 렌더하세요. "
        "격자 이미지를 Read로 열어 화면을 직접 확인할 수 있습니다.\n" + text + "\n")
    return 2


def main():
    args = sys.argv[1:]
    if args == ["--baseline"]:
        state = load_json(STATE, {})
        for path in find_videos():
            state.setdefault(rel(path), dict(signature(path), ok=None, problems=[]))
        save_state(state)
        print("기준선 기록: {}개".format(len(state)))
        return 0
    if args:
        cfg = load_json(CONFIG, {})
        state = load_json(STATE, {})
        bad = False
        for a in args:
            path = os.path.abspath(a)
            r = check(path, cfg)
            if r is None:
                print("읽을 수 없음(렌더 중?): " + a)
                bad = True
                continue
            state[rel(path)] = dict(signature(path), ok=r["ok"], problems=r["problems"])
            bad |= not r["ok"]
            print(describe(r))
        save_state(state)
        return 1 if bad else 0

    try:
        payload = json.load(sys.stdin)
    except ValueError:
        payload = {}
    if not os.path.isdir(OUT):
        return 0
    return run_hook(payload.get("hook_event_name", "PostToolUse"))


if __name__ == "__main__":
    sys.exit(main())
