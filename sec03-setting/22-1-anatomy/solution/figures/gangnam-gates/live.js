const DATA = __DATA__;
const follow = null;
const stage = document.querySelector(".gg-stage");
const readout = document.querySelector("[data-readout]");
const slider = document.getElementById("gg-hour");
const sliderOut = document.getElementById("gg-hour-out");
const apartButton = document.getElementById("gg-apart");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const N = 8; // 통로마다 빛 줄기 최대 수
const SPEED = 30; // 빛 줄기 속도(월드 단위/초)
const RUN = 88; // 빛 줄기가 지나가는 길이
const fmt = (n) => n.toLocaleString("ko-KR");
const hourLabel = (h) => `${String(h).padStart(2, "0")}시`;
const hash = (i, j) => {
  const s = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

// ---- 상태 ----
let angle = -18;
let target = -18;
let hour = DATA.start;
let clock = 0;
let frame = 0;
let last = 0;
let visible = false;
let touring = !still.matches;
let idle = 0;
let tourClock = 0;
let hooked = Boolean(window.__isoVerify); // 검사 도구가 자세를 잡으면(검사용 빌드는 처음부터) 루프가 덮어쓰지 않는다
const apart = { x: 0, v: 0, to: 0 };
const lanes = DATA.gl.lanes.map(() => ({ rho: { x: 0, v: 0 }, open: 0 }));
// 계수기: 리셋(드럼을 앞으로 돌려 0에 맞춤) → 0부터 목표값까지 센다.
const counters = {
  on: { value: DATA.on[hour], target: DATA.on[hour], phase: "rest", t: 0, from: null },
  off: { value: DATA.off[hour], target: DATA.off[hour], phase: "rest", t: 0, from: null },
};
const places = Array.from({ length: 5 }, (_, p) => p);
// 기계식 자리올림: 아랫자리가 9→0으로 넘어가는 동안에만 윗자리가 한 칸 돈다.
const positionOf = (v, p) => {
  if (p === 0) return ((v % 10) + 10) % 10;
  const unit = 10 ** p;
  const below = v % unit;
  return (Math.floor(v / unit) % 10) + Math.min(1, Math.max(0, below - (unit - 1)));
};
const anglesOf = (c) =>
  places.map((p) => {
    if (c.phase === "reset") {
      const a0 = c.from[p];
      return a0 + (((360 - a0) % 360) * ease(c.t));
    }
    return ((positionOf(c.value, p) * 36) % 360 + 360) % 360;
  });
const drumValues = () => {
  const out = {};
  for (const kind of ["on", "off"]) {
    const angles = anglesOf(counters[kind]);
    places.forEach((p) => (out[`d.${kind}.${p}`] = angles[p] % 360));
  }
  return out;
};

// ---- 빛 줄기(셰이더와 같은 식): 날개문은 줄기가 가운데를 지날 때 열린다 ----
const pulseY = (i, j, dir) => dir * (-RUN / 2 + RUN * ((hash(i, j) + (clock * SPEED) / RUN) % 1));
const openTarget = (j) => {
  const [, , dir] = DATA.gl.lanes[j];
  const rho = lanes[j].rho.x;
  let open = 0;
  for (let i = 0; i < N; i++) {
    const g = Math.min(1, Math.max(0, rho * N - i));
    if (g <= 0) break;
    const y = pulseY(i, j, dir);
    const near = 1 - ease((Math.abs(y + dir * 4) - 5) / 9);
    open = Math.max(open, g * near);
  }
  return open;
};

// ---- 화면 ----
let paint = () => {};
let own = false;
const controller = TURN.mount(stage, DATA.turn, {
  follow,
  onHold: () => {
    touring = false;
    hooked = true;
    clearTimeout(idle);
  },
  onFrame: (turned) => {
    if (!own) angle = target = turned.values.bank ?? angle;
    paint();
  },
});
const show = () => {
  const on = Math.floor(counters.on.value);
  const off = Math.floor(counters.off.value);
  const resetting = counters.on.phase === "reset" || counters.off.phase === "reset";
  const text = resetting ? `${hourLabel(DATA.hours[hour])} · 계수기 리셋` : `${hourLabel(DATA.hours[hour])} · 승차 ${fmt(on)} · 하차 ${fmt(off)}명`;
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-description", `${hourLabel(DATA.hours[hour])} 하루 평균 승차 ${fmt(DATA.on[hour])}명, 하차 ${fmt(DATA.off[hour])}명${apart.to ? ", 분해됨" : ""}`);
};
// 적응형 반 프레임: set() 시간이 길면(느린 폰) live layer를 한 프레임 걸러 그린다. 움직임은 시간 기준이라 속도는 그대로다.
let cost = 0;
let half = false;
let skip = false;
const draw = (force = false) => {
  if (half && !force && (skip = !skip)) return;
  own = true;
  const t0 = performance.now();
  controller.set({ bank: angle, apart: apart.x, open: lanes.map((l) => l.open), drums: drumValues() });
  cost = cost ? cost * 0.9 + (performance.now() - t0) * 0.1 : performance.now() - t0;
  half = half ? cost > 9 : cost > 14;
  own = false;
};

// ---- WebGL: 통로 바닥을 흐르는 빛 ----
const GLD = DATA.gl;
const LIGHT = (stage.closest("[data-theme]")?.getAttribute("data-theme") ?? "dark") !== "dark" ? 1 : 0;
const f = (n) => Number(n).toFixed(3);
const laneConst = GLD.lanes.map(([x, hw, dir, kind], j) => `if(j==${j}){X=${f(x)};HW=${f(hw)};DIR=${f(dir)};KIND=${f(kind)};}`).join("");
const FRAGMENT = `${glslPose("Bank")}
uniform vec4 uRho;
uniform float uClock;
uniform float uLight;
const float FT=${f(GLD.floorTop)};
const vec2 PC=vec2(${f(GLD.floor.x + GLD.floor.w / 2)},${f(GLD.floor.y + GLD.floor.d / 2)});
const vec2 PH=vec2(${f(GLD.floor.w / 2)},${f(GLD.floor.d / 2)});
const float PR=${f(GLD.floor.r)};
float sdPlate(vec2 p){vec2 q=abs(p-PC)-PH+PR;return length(max(q,0.))+min(max(q.x,q.y),0.)-PR;}
float h1(float i,float j){return fract(sin(i*12.9898+j*78.233)*43758.5453);}
vec4 over(vec4 top,vec4 under){return top+under*(1.-top.a);}
vec4 inkFor(vec3 seen,float cover){vec3 absorbed=1.-seen;float a=max(max(absorbed.r,max(absorbed.g,absorbed.b)),cover);return vec4(vec3(a)-absorbed,a);}
vec4 glow(float e,vec3 body,vec3 hot,vec3 core){
  float l=1.-exp(-2.1*e);
  float c=smoothstep(.55,.95,l);
  vec3 dark=mix(hot,core,c)*l;
  vec4 dk=vec4(dark,max(dark.r,max(dark.g,dark.b)));
  float lb=smoothstep(0.,.55,l);
  vec3 seen=mix(mix(vec3(1.),body,lb),core,.38*smoothstep(.8,1.,l));
  vec4 lt=inkFor(seen,.72*lb)*lb;
  return mix(dk,lt,uLight);
}
void main(){
  vec2 vb=viewOf(gl_FragCoord.xy);
  vec3 q=toBank(onFloor(vb,FT));
  float px=pixelOf()/uCam.z;
  float plate=1.-smoothstep(-2.2,-.3-.7*px,sdPlate(q.xy));
  float eOn=0.,eOff=0.;
  for(int j=0;j<4;j++){
    float X=0.,HW=1.,DIR=1.,KIND=0.;
    ${laneConst}
    float rho=j==0?uRho.x:j==1?uRho.y:j==2?uRho.z:uRho.w;
    if(rho<.0005)continue;
    float dx=q.x-X;
    float inLane=1.-smoothstep(HW-3.,HW-.9,abs(dx));
    float ends=1.-smoothstep(29.,34.,abs(q.y));
    float e=rho*.34*exp(-dx*dx/(HW*HW*.3));
    for(int i=0;i<${N};i++){
      float fi=float(i);
      float g=clamp(rho*${N}.-fi,0.,1.);
      if(g<=0.)break;
      float y=DIR*(-${RUN / 2}.+${RUN}.*fract(h1(fi,float(j))+uClock*${SPEED}./${RUN}.));
      float xo=(h1(fi+9.,float(j))-.5)*HW*.9;
      float ax=(dx-xo)/3.;
      float t=(q.y-y)*DIR;
      float head=1.4*exp(-ax*ax-(t*t)/22.);
      float tail=exp(-ax*ax*1.5)*smoothstep(-34.,-1.,t)*(1.-smoothstep(-1.,2.,t))*.75;
      e+=g*(head+tail);
    }
    e*=inLane*ends;
    if(KIND<.5)eOn+=e;else eOff+=e;
  }
  vec4 on=glow(eOn,vec3(.22,.53,.90),vec3(.32,.64,1.),vec3(.88,.95,1.));
  vec4 off=glow(eOff,vec3(.85,.35,.15),vec3(1.,.48,.18),vec3(1.,.93,.82));
  vec4 ink=over(on,off)*plate;
  ink.rgb=min(ink.rgb,vec3(ink.a));
  float n=(hash12(gl_FragCoord.xy+fract(uClock*.61)*91.)-.5)/255.*smoothstep(0.,1.5/255.,ink.a);
  gl_FragColor=clamp(ink+vec4(n),0.,1.);
}`;
const layer = glLayer({ canvas: stage.querySelector('[data-canvas="lanes"]'), fragment: FRAGMENT, view: [GLD.W, GLD.H], camera: GLD.camera, uniforms: ["uRho", "uClock", "uBankX", "uBankY", "uBankZ", "uBankT"], fixed: { uLight: LIGHT } });
if (layer) stage.setAttribute("data-gl", "");
paint = () => {
  if (!layer) return;
  const rho = lanes.map((l) => l.rho.x);
  if (Math.max(...rho) < 1e-3) return layer.clear();
  layer.draw({ uRho: rho, uClock: clock, ...TURN.poseUniforms(controller, "bank", "uBank") }, clock);
};

// ---- 시간대 바꾸기 ----
const rhoTarget = (j) => (DATA.gl.lanes[j][3] ? DATA.off[hour] : DATA.on[hour]) / DATA.peak;
const setHour = (next) => {
  next = ((next % DATA.hours.length) + DATA.hours.length) % DATA.hours.length;
  if (next === hour && counters.on.phase === "rest") return;
  hour = next;
  for (const kind of ["on", "off"]) {
    const c = counters[kind];
    c.from = anglesOf(c).map((a) => a % 360);
    c.phase = "reset";
    c.t = 0;
    c.target = (kind === "on" ? DATA.on : DATA.off)[hour];
  }
  slider.value = String(hour);
  sliderOut.textContent = hourLabel(DATA.hours[hour]);
  slider.setAttribute("aria-valuetext", hourLabel(DATA.hours[hour]));
  run();
};
const stepCounter = (c, dt, calm) => {
  if (c.phase === "rest") return false;
  if (calm) {
    c.phase = "rest";
    c.value = c.target;
    return true;
  }
  if (c.phase === "reset") {
    c.t = Math.min(1, c.t + dt / 0.45);
    if (c.t >= 1) {
      c.phase = "count";
      c.t = 0;
      c.value = 0;
    }
    return true;
  }
  c.t = Math.min(1, c.t + dt / 2.2);
  c.value = c.target * (1 - (1 - c.t) ** 3);
  if (c.t >= 1) {
    c.value = c.target;
    c.phase = "rest";
  }
  return true;
};

// ---- 루프 ----
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (calm) touring = false;
  if (touring) {
    target += 5 * dt;
    tourClock += dt;
    if (tourClock > 4.2) {
      tourClock = 0;
      setHour(hour + 1);
    }
  }
  if (!calm) clock += dt;
  angle = calm ? target : angle + (target - angle) * (1 - Math.exp(-dt / 0.12));
  if (Math.abs(target - angle) < 1e-3) angle = target;
  let moving = touring || angle !== target;
  if (settle(apart, apart.to, dt, 0.55, calm)) moving = true;
  lanes.forEach((l, j) => {
    if (settle(l.rho, rhoTarget(j), dt, 0.8, calm)) moving = true;
    const want = calm ? 0 : openTarget(j);
    l.open = calm ? want : l.open + (want - l.open) * (1 - Math.exp(-dt / 0.1));
    if (l.rho.x > 1e-3 && !calm) moving = true;
  });
  for (const c of Object.values(counters)) if (stepCounter(c, dt, calm)) moving = true;
  if (!hooked) draw(!moving);
  show();
  frame = visible && moving && !hooked ? requestAnimationFrame(tick) : 0;
}
const run = () => {
  if (!frame && visible && !hooked) {
    last = 0;
    frame = requestAnimationFrame(tick);
  }
};
const hold = () => {
  touring = false;
  clearTimeout(idle);
  idle = setTimeout(() => {
    touring = !still.matches;
    tourClock = 0;
    run();
  }, 6000);
};
new IntersectionObserver(
  (entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    if (visible) run();
    else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  },
  { rootMargin: "120px 0px" },
).observe(stage);

// ---- 입력: 끌면 돌리고, 끌지 않고 누르면 분해 ----
const toggleApart = () => {
  apart.to = apart.to ? 0 : 1;
  apartButton.setAttribute("aria-pressed", String(Boolean(apart.to)));
  apartButton.textContent = apart.to ? "조립" : "분해";
  hold();
  run();
};
let drag = null;
stage.addEventListener("pointerdown", (event) => {
  hold();
  drag = { from: controller.angleAt(event.clientX, event.clientY, DATA.gl.floorTop, "bank"), base: target, x: event.clientX, y: event.clientY, id: event.pointerId, captured: false };
});
stage.addEventListener("pointermove", (event) => {
  if (!drag || event.pointerId !== drag.id) return;
  if (!drag.captured && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 5) return;
  hold();
  if (!drag.captured) {
    drag.captured = true;
    stage.setPointerCapture(event.pointerId);
    stage.setAttribute("data-drag", "");
  }
  target = drag.base + controller.angleAt(event.clientX, event.clientY, DATA.gl.floorTop, "bank") - drag.from;
  run();
});
const release = (event) => {
  if (!drag || event.pointerId !== drag.id) return;
  const clicked = !drag.captured && event.type === "pointerup";
  drag = null;
  stage.removeAttribute("data-drag");
  try {
    stage.releasePointerCapture(event.pointerId);
  } catch {}
  if (clicked) toggleApart();
};
stage.addEventListener("pointerup", release);
stage.addEventListener("pointercancel", release);
stage.addEventListener("keydown", (event) => {
  let handled = true;
  if (event.key === "ArrowRight") setHour(hour + 1);
  else if (event.key === "ArrowLeft") setHour(hour - 1);
  else if (event.key === "ArrowUp") target = Math.round(target / 15) * 15 + 15;
  else if (event.key === "ArrowDown") target = Math.round(target / 15) * 15 - 15;
  else if (event.key === " " || event.key === "Enter" || event.key === "e" || event.key === "E") toggleApart();
  else handled = false;
  if (!handled) return;
  event.preventDefault();
  hold();
  run();
});
slider.addEventListener("input", () => {
  hold();
  setHour(Number(slider.value));
});
apartButton.addEventListener("click", toggleApart);
if (still.matches) touring = false;
lanes.forEach((l, j) => (l.rho.x = rhoTarget(j)));
draw(true);
show();
