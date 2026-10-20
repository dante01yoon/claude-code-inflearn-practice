import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT, WORK, STAGES, listProjects, currentProject, setCurrent, resolveProject, evaluate, approve,
} from './lib.mjs';

const [cmd, ...args] = process.argv.slice(2);
const tty = process.stdout.isTTY;
const COLOR = { PASS: 32, FAIL: 31, TODO: 90, WAIT: 33 };
const paint = (s) => (tty ? `\x1b[${COLOR[s]}m${s}\x1b[0m` : s);
const die = (msg) => {
  console.error(msg);
  process.exit(1);
};

function report(project) {
  const res = evaluate(project);
  console.log(`\n${project}  (work/${project})`);
  for (const r of res) {
    console.log(`  ${paint(r.status)}  ${r.id.padEnd(10)} ${r.notes.join('; ')}`);
  }
  const next = res.find((r) => r.status !== 'PASS');
  console.log(next ? `  → 다음: ${next.id} (${next.status})` : '  → 전 단계 PASS');
  return res.some((r) => r.status === 'FAIL');
}

const commands = {
  check() {
    let projects;
    if (args[0] || currentProject()) projects = [resolveProject(args[0])];
    else projects = listProjects();
    if (!projects.length) die('work/에 프로젝트가 없음 (npm run new <이름>)');
    const failed = projects.map(report).some(Boolean);
    process.exit(failed ? 1 : 0);
  },

  approve() {
    const [stageId, projectArg] = args;
    if (!stageId) die('사용법: npm run approve <단계> [프로젝트]');
    const project = resolveProject(projectArg);
    const { already } = approve(project, stageId);
    console.log(already ? `${project}/${stageId}: 이미 승인됨` : `${project}/${stageId}: 승인 완료`);
    report(project);
  },

  new() {
    const name = args[0];
    if (!name || !/^[\w.-]+$/.test(name) || name.startsWith('.')) die('사용법: npm run new <이름> (영문·숫자·-_.)');
    const dir = path.join(WORK, name);
    if (fs.existsSync(dir)) die(`이미 있음: work/${name}`);
    fs.cpSync(path.join(ROOT, 'harness', 'templates'), dir, { recursive: true });
    setCurrent(name);
    console.log(`work/${name} 생성, 현재 프로젝트로 지정`);
    report(name);
  },

  use() {
    const name = resolveProject(args[0] ?? die('사용법: npm run use <이름>'));
    setCurrent(name);
    console.log(`현재 프로젝트: ${name}`);
  },
};

if (!commands[cmd]) die(`명령: ${Object.keys(commands).join(', ')} / 단계: ${STAGES.map((s) => s.id).join(' → ')}`);
try {
  commands[cmd]();
} catch (e) {
  die(e.message);
}
