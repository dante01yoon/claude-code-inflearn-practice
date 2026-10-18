import type React from "react";
import { Img, staticFile } from "remotion";
import { LanternCat } from "../elements/LanternCat";

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const BG = {
  plaza: "241-lantern-station-plaza",
  platform: "243-station-train-platform",
  alley: "246-rainy-lantern-alley",
  bridge: "250-alley-moon-bridge",
  pier: "252-harbor-lighthouse-pier",
  festival: "256-rooftop-festival-square",
  shrine: "260-rooftop-moon-shrine",
} as const;

const PROP = {
  bungeoppang: "061_bungeoppang",
  tteokbokki: "062_tteokbokki",
  udon: "063_udon",
  ramen: "064_ramen",
  bench: "181_moon_ear_market_bench",
  cafeTable: "182_crescent_cafe_table",
  stool: "183_paw_wooden_stool",
  armchair: "184_woven_cat_armchair",
  picnic: "185_folding_picnic_table",
  barrel: "186_barrel_cocktail_table",
  coin: "261-paw-coin",
  gem: "262-moon-gem",
} as const;

const CHAR = {
  tea: "001_tea_shopkeeper",
  cat: "003_lantern_shopkeeper",
  astronomer: "019_astronomer_customer",
  raincoat: "038_raincoat_customer",
  firefly: "054_lantern_firefly_companion",
} as const;

export type BgName = keyof typeof BG;
export type PropName = keyof typeof PROP;
export type CharName = keyof typeof CHAR;

export const bgSrc = (name: BgName) => staticFile(`mooncat/backgrounds/${BG[name]}.png`);
export const propSrc = (name: PropName) => staticFile(`mooncat/props/${PROP[name]}.png`);
export const charSrc = (name: CharName) => staticFile(`mooncat/characters/${CHAR[name]}.png`);

// 003 원본 PNG(1024×1536) 기준 비율
export const CAT_ASPECT = 1024 / 1536;
export const CAT_FACE_X = 0.48;
export const CAT_FACE_Y = 0.33;
const CAT_FEET = 0.95;

/** 화면을 꽉 채우는 배경. style로 크기·위치를 덮어쓸 수 있다. */
export const Bg: React.FC<{ readonly name: BgName; readonly style?: React.CSSProperties }> = ({
  name,
  style,
}) => (
  <Img
    src={bgSrc(name)}
    style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", objectFit: "cover", ...style }}
  />
);

/** 중심 x(cx)와 발바닥 y(feet) 기준으로 놓는 투명 PNG 소품 */
export const Prop: React.FC<{
  readonly name: PropName;
  readonly size: number;
  readonly cx: number;
  readonly cy: number;
  readonly style?: React.CSSProperties;
}> = ({ name, size, cx, cy, style }) => (
  <Img
    src={propSrc(name)}
    style={{ position: "absolute", width: size, height: size, left: cx - size / 2, top: cy - size / 2, ...style }}
  />
);

/** 조연 캐릭터: 중심 x, 발 y, 높이 */
export const Character: React.FC<{
  readonly name: CharName;
  readonly height: number;
  readonly cx: number;
  readonly feet: number;
  readonly style?: React.CSSProperties;
}> = ({ name, height, cx, feet, style }) => (
  <div style={{ position: "absolute", left: cx, top: feet - height * CAT_FEET, ...style }}>
    <Shadow width={height * 0.42} x={0} y={height * CAT_FEET} />
    <Img src={charSrc(name)} style={{ position: "absolute", height, left: 0, top: 0, translate: "-50% 0" }} />
  </div>
);

const Shadow: React.FC<{ readonly width: number; readonly x: number; readonly y: number }> = ({ width, x, y }) => (
  <div
    style={{
      position: "absolute",
      left: x - width / 2,
      top: y - width * 0.08,
      width,
      height: width * 0.16,
      borderRadius: "50%",
      background: "radial-gradient(ellipse, rgba(10,0,25,0.55) 0%, rgba(10,0,25,0) 70%)",
    }}
  />
);

/** 주인공(003 등불가게 검은 고양이). cx = 몸 중심 x, feet = 발 y, size = 이미지 높이 */
export const HeroCat: React.FC<{
  readonly size: number;
  readonly cx: number;
  readonly feet: number;
  readonly shadow?: boolean;
  readonly style?: React.CSSProperties;
}> = ({ size, cx, feet, shadow = true, style }) => (
  <div style={{ position: "absolute", left: 0, top: 0, ...style }}>
    {shadow ? <Shadow width={size * 0.42} x={cx} y={feet} /> : null}
    <LanternCat size={size} style={{ left: cx - (size * CAT_ASPECT) / 2, top: feet - size * CAT_FEET }} />
  </div>
);

/** HeroCat 얼굴 중심 좌표 */
export const catFace = (size: number, cx: number, feet: number) => ({
  x: cx - (size * CAT_ASPECT) / 2 + size * CAT_ASPECT * CAT_FACE_X,
  y: feet - size * CAT_FEET + size * CAT_FACE_Y,
});

export const Vignette: React.FC<{ readonly strength?: number }> = ({ strength = 0.55 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(8,0,20,${strength}) 100%)`,
    }}
  />
);
