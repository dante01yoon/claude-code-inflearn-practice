"""고치기 전/뒤 화면 PNG 나란히 → img/pair-<화면>.png (피그마 export 2배 PNG 그대로)"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
D = os.path.dirname(os.path.abspath(__file__))
F = ImageFont.truetype(os.path.join(D, "..", "..", "f", "shared", "fonts", "NotoSansKR-Bold.otf"), 52)
for s in sys.argv[1:]:
    ims = [Image.open(os.path.join(D, k, s + ".png")).convert("RGB") for k in ("before", "after")]
    h = 1300
    ims = [im.resize((round(im.width * h / im.height), h)) for im in ims]
    W = sum(im.width for im in ims) + 3 * 60
    out = Image.new("RGB", (W, h + 140), (244, 245, 242))
    d = ImageDraw.Draw(out)
    x = 60
    for im, lab, col in zip(ims, ("고치기 전", "고친 뒤"), ((86, 99, 109), (0, 118, 74))):
        out.paste(im, (x, 110))
        tw = d.textlength(lab, font=F)
        d.text((x + (im.width - tw) / 2, 20), lab, font=F, fill=col)
        x += im.width + 60
    out.save(os.path.join(D, f"pair-{s}.png"))
    print(s, out.size)
