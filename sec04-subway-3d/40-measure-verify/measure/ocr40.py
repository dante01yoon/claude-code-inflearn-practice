"""📏 (지도 영역만 잘라 2배로 키운 뒤 인식)
 40강 두 번째 실험: 스크린샷에서 TOP 5 역 이름(한글)이 실제로 읽히는지 macOS 글자 인식으로 센다.
사용: uvx --with pyobjc-framework-Vision python ocr40.py <run폴더> <expected.json>  → <run폴더>/check2.json"""
import json, os, sys
import objc, Quartz, Vision
from Foundation import NSURL
D, E = sys.argv[1], json.load(open(sys.argv[2]))
def texts(p):
    from PIL import Image
    im = Image.open(p).convert("RGB")
    im = im.crop((560, 60, im.width, im.height)).resize(((im.width - 560) * 2, (im.height - 60) * 2), Image.LANCZOS)
    p = p.replace(".png", "-x2.png"); im.save(p)
    src = Quartz.CGImageSourceCreateWithURL(NSURL.fileURLWithPath_(p), None)
    img = Quartz.CGImageSourceCreateImageAtIndex(src, 0, None)
    req = Vision.VNRecognizeTextRequest.alloc().init()
    req.setRecognitionLevel_(Vision.VNRequestTextRecognitionLevelAccurate); req.setUsesLanguageCorrection_(False)
    req.setRecognitionLanguages_(["ko-KR", "en-US"])
    Vision.VNImageRequestHandler.alloc().initWithCGImage_options_(img, None).performRequests_error_([req], None)
    W = Quartz.CGImageGetWidth(img)
    out = []
    for ob in req.results() or []:
        bb = ob.boundingBox()
        out.append(ob.topCandidates_(1)[0].string())
    return " ".join(out)
s = json.load(open(os.path.join(D, "shot.json")))
R = {}
for key, i in (("K2_labels_08", "4"), ("K3_labels_18", "14")):
    with objc.autorelease_pool():
        t = texts(os.path.join(D, "h08.png" if i == "4" else "h18.png")).replace(" ", "")
    names = [n.split("(")[0] for n in E[i]]
    hit = [n for n in names if n in t]
    R[key] = {"pass": len(hit) >= 2, "note": f"찾은 이름 {hit}"}
R["K1_no_js_errors"] = {"pass": not s["errs"], "note": json.dumps(s["errs"][:3], ensure_ascii=False)}
R["K4_375px_no_overflow"] = {"pass": s["sw"] <= 375, "note": f"scrollWidth={s['sw']}"}
bugs = sum(not v["pass"] for v in R.values())
json.dump({"bugs": bugs, "checks": R}, open(os.path.join(D, "check2.json"), "w"), ensure_ascii=False, indent=1)
print(bugs, json.dumps(R, ensure_ascii=False))
