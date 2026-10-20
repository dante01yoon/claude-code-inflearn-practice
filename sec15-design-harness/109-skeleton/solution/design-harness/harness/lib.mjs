import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { STAGES, FIGMA_GATES } from './stages.mjs';

export { STAGES, FIGMA_GATES };
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const WORK = path.join(ROOT, 'work');
const CURRENT = path.join(WORK, '.current');
const APPROVALS = '.approvals.json';

export function listProjects() {
  if (!fs.existsSync(WORK)) return [];
  return fs
    .readdirSync(WORK, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort();
}

export function currentProject() {
  const name = fs.existsSync(CURRENT) ? fs.readFileSync(CURRENT, 'utf8').trim() : '';
  return name && fs.existsSync(path.join(WORK, name)) ? name : null;
}

export function setCurrent(name) {
  fs.mkdirSync(WORK, { recursive: true });
  fs.writeFileSync(CURRENT, name + '\n');
}

// 인자 > work/.current > 프로젝트가 하나뿐이면 그것. 못 정하면 에러.
export function resolveProject(arg) {
  if (arg) {
    if (!fs.existsSync(path.join(WORK, arg))) throw new Error(`프로젝트 없음: work/${arg}`);
    return arg;
  }
  const cur = currentProject();
  if (cur) return cur;
  const all = listProjects();
  if (all.length === 1) return all[0];
  throw new Error(
    all.length === 0
      ? 'work/에 프로젝트가 없음 (npm run new <이름>)'
      : `프로젝트를 지정해야 함: ${all.join(', ')} (npm run use <이름>)`,
  );
}

// `## 제목` 단위로 본문을 나눈다. HTML 주석은 빈 내용으로 본다.
function parseSections(md) {
  const out = {};
  let key = null;
  for (const line of md.replace(/<!--[\s\S]*?-->/g, '').split('\n')) {
    const h = line.match(/^(#{1,2})\s+(.+?)\s*#*\s*$/);
    if (h) {
      key = h[1] === '##' ? h[2] : null;
      if (key) out[key] = '';
    } else if (key) {
      out[key] += line + '\n';
    }
  }
  for (const k of Object.keys(out)) out[k] = out[k].trim();
  return out;
}

function evaluateOwn(dir, stage) {
  const read = (f) => {
    const p = path.join(dir, f);
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  };
  const md = read(stage.file);
  if (md == null) return { ok: false, status: 'TODO', notes: [`파일 없음: ${stage.file}`] };

  const sections = parseSections(md);
  const missing = stage.sections.filter((s) => !(s in sections));
  const empty = stage.sections.filter((s) => s in sections && !sections[s]);
  if (missing.length + empty.length === stage.sections.length) {
    return { ok: false, status: 'TODO', notes: ['아직 작성 안 됨'] };
  }

  const errors = [];
  if (missing.length) errors.push(`섹션 없음: ${missing.join(', ')}`);
  if (empty.length) errors.push(`섹션 비어 있음: ${empty.join(', ')}`);
  if (stage.extra) errors.push(...stage.extra({ read, sections }));
  return errors.length ? { ok: false, status: 'FAIL', notes: errors } : { ok: true };
}

function hashStage(dir, stage) {
  const h = crypto.createHash('sha256');
  for (const f of [stage.file, ...(stage.also ?? [])]) {
    const p = path.join(dir, f);
    h.update(f + '\0' + (fs.existsSync(p) ? fs.readFileSync(p) : '') + '\0');
  }
  return h.digest('hex');
}

function readApprovals(dir) {
  const p = path.join(dir, APPROVALS);
  try {
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
  } catch {
    return {};
  }
}

// 단계별 { id, status, notes, ownOk, priorOk } 배열
export function evaluate(project) {
  const dir = path.join(WORK, project);
  const approvals = readApprovals(dir);
  let blocker = null;
  return STAGES.map((stage) => {
    const own = evaluateOwn(dir, stage);
    const priorOk = blocker == null;
    let status = own.status;
    let notes = own.notes ?? [];
    if (own.ok) {
      const a = approvals[stage.id];
      if (!priorOk) [status, notes] = ['WAIT', [`앞 단계 대기: ${blocker}`]];
      else if (!stage.gate) status = 'PASS';
      else if (!a) [status, notes] = ['WAIT', [`승인 필요: npm run approve ${stage.id}`]];
      else if (a.hash !== hashStage(dir, stage)) [status, notes] = ['WAIT', ['승인 후 변경됨 → 재승인 필요']];
      else [status, notes] = ['PASS', [`승인 ${a.at}`]];
    }
    if (status !== 'PASS' && blocker == null) blocker = stage.id;
    return { id: stage.id, status, notes, ownOk: !!own.ok, priorOk };
  });
}

export function approve(project, stageId) {
  const stage = STAGES.find((s) => s.id === stageId);
  if (!stage) throw new Error(`없는 단계: ${stageId}`);
  if (!stage.gate) throw new Error(`${stageId}는 승인 단계가 아님 (승인 단계: ${STAGES.filter((s) => s.gate).map((s) => s.id).join(', ')})`);
  const r = evaluate(project).find((x) => x.id === stageId);
  if (r.status === 'PASS') return { already: true };
  if (!r.priorOk) throw new Error(r.notes.join('; '));
  if (!r.ownOk) throw new Error(`${stageId}가 ${r.status} 상태: ${r.notes.join('; ')}`);
  const dir = path.join(WORK, project);
  const approvals = readApprovals(dir);
  approvals[stageId] = { hash: hashStage(dir, stage), at: new Date().toISOString() };
  fs.writeFileSync(path.join(dir, APPROVALS), JSON.stringify(approvals, null, 2) + '\n');
  return { already: false };
}

// 피그마 쓰기 허용 여부. 막히면 이유 문자열, 허용이면 null.
export function figmaBlockReason() {
  let project;
  try {
    project = resolveProject();
  } catch (e) {
    return e.message;
  }
  const res = evaluate(project);
  const bad = FIGMA_GATES.map((id) => res.find((r) => r.id === id)).filter((r) => r.status !== 'PASS');
  if (!bad.length) return null;
  return `[${project}] 승인 전: ` + bad.map((r) => `${r.id}=${r.status} (${r.notes.join('; ')})`).join(', ');
}
