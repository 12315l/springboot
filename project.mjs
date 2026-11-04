import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Project-local lifecycle only. Generators and shared diagnostics live in the Skill.
const ownRoot = path.dirname(fileURLToPath(import.meta.url));
export function toolkitEntry(env = process.env) {
  const hint = env.JX_PLATFORM_TOOLKIT;
  const base = hint || path.join(os.homedir(), '.codex/skills/jx-build-backend-module/scripts/project-toolkit');
  const candidates = [base, path.join(base, 'tools/platform.mjs'), path.join(base, 'platform.mjs')];
  return candidates.find(p => fs.existsSync(p) && fs.statSync(p).isFile()) || null;
}
function within(root, relative) {
  const p = path.resolve(root, relative);
  if (p === root || !p.startsWith(root + path.sep)) throw new Error('项目配置路径越界');
  const nearest = fs.existsSync(p) ? p : path.dirname(p);
  if (fs.existsSync(nearest) && !fs.realpathSync(nearest).startsWith(fs.realpathSync(root) + path.sep)) throw new Error('项目配置目录链接越界');
  return p;
}
export function nativePlan(root, command, args = []) {
  for (let j = 0; j < args.length; j++) { if (args[j] === '--plan') continue; if (args[j] === '--clients' && args[j + 1]) { j++; continue; } throw new Error('无法识别参数：' + args[j]); }
  root = path.resolve(root);
  const conf = JSON.parse(fs.readFileSync(path.join(root, 'platform.json'), 'utf8'));
  const project = path.join(root, 'project.json');
  const configured = fs.existsSync(project) ? JSON.parse(fs.readFileSync(project, 'utf8')).clients : ['admin', 'front'];
  const i = args.indexOf('--clients'), clients = i < 0 ? configured : (args[i + 1] || '').split(',');
  if (!clients.length || new Set(clients).size !== clients.length || clients.some(x => !['admin', 'front', 'app'].includes(x))) throw new Error('clients仅支持admin,front,app');
  if (command === 'build' && configured.some(x => !clients.includes(x))) throw new Error('完整构建必须包含配置的全部客户端');
  const backend = within(root, conf.backend);
  const steps = [];
  for (const client of clients) {
    const cwd = within(root, conf[client]);
    if (command !== 'dev') steps.push({ executable: 'npm', args: ['run', 'type-check'], cwd });
    if (command === 'build') steps.push({ executable: 'npm', args: ['run', client === 'app' ? 'build:h5' : 'build-only'], cwd,
      env: { VITE_BASE_URL: '/', VITE_UPLOAD_URL: '/file/upload', VITE_IMG_URL: '/file/free/preview?businessKey=', ...(client === 'app' ? { UNI_H5_PUBLIC_PATH: '/vue/app/', VITE_SERVER_BASEURL: '/' } : {}) }, client });
    if (command === 'dev') steps.push({ executable: 'npm', args: ['run', client === 'app' ? 'dev:h5' : 'dev'], cwd });
  }
  steps.push({ executable: 'mvn', args: command === 'build' ? ['-DskipTests', 'package'] : command === 'dev' ? ['spring-boot:run'] : ['-Dtest=PageUtilTest,FileConfigTest,HealthControllerTest', 'test'], cwd: backend });
  return { root, command, clients, backend, steps, sharedSkillRequired: false };
}
function start(step, async = false) {
  const windowsBatch = process.platform === 'win32' && ['npm', 'mvn'].includes(step.executable);
  const executable = windowsBatch ? 'cmd.exe' : step.executable;
  const args = windowsBatch ? ['/d', '/s', '/c', `${step.executable}.cmd ${step.args.join(' ')}`] : step.args;
  const options = { cwd: step.cwd, env: { ...process.env, ...step.env }, stdio: 'inherit' };
  if (async) return spawn(executable, args, options);
  const result = spawnSync(executable, args, options);
  if (result.error || result.status !== 0) throw new Error(`${step.executable}失败，退出码${result.status}`);
}
async function nativeRun(root, command, args) {
  const plan = nativePlan(root, command, args);
  if (args.includes('--plan')) { console.log(JSON.stringify(plan, null, 2)); return; }
  if (command === 'dev') {
    const children = plan.steps.map(step => start(step, true));
    const stop = () => children.forEach(child => { if (child.pid) { if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F']); else child.kill('SIGTERM'); } });
    process.on('SIGINT', stop); process.on('SIGTERM', stop);
    children.forEach(child => { child.on('error', stop); child.on('exit', code => { if (code) stop(); }); });
    return;
  }
  // Keep deployable frontend assets with the backend when building without the Skill.
  const packaged = within(plan.backend, 'src/main/resources/vue');
  const previous = within(plan.root, '.delivery/native-build-previous-' + Date.now());
  let touched = false, hadPrevious = false;
  try {
    for (const step of plan.steps) {
      if (command === 'build' && step.executable === 'mvn') {
        if (fs.existsSync(packaged)) { fs.mkdirSync(path.dirname(previous), { recursive: true }); fs.renameSync(packaged, previous); hadPrevious = true; }
        fs.mkdirSync(packaged, { recursive: true }); touched = true;
        for (const client of plan.clients) {
          const cwd = plan.steps.find(s => s.client === client).cwd;
          const dist = path.join(cwd, client === 'app' ? 'dist/build/h5' : 'dist');
          if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error(`${client}缺少构建入口`);
          fs.cpSync(dist, path.join(packaged, client), { recursive: true });
        }
      }
      start(step);
    }
    if (hadPrevious) fs.rmSync(previous, { recursive: true });
    if (command === 'build') console.log('原生构建完成：后端target中的JAR包含客户端静态资源。新库初始化/完整发布包使用npm run release。');
  } catch (error) {
    if (touched && fs.existsSync(packaged)) fs.rmSync(packaged, { recursive: true });
    if (hadPrevious) fs.renameSync(previous, packaged);
    throw error;
  }
}
export async function main(args = process.argv.slice(2)) {
  const command = args[0] || 'help', rest = args.slice(1), root = ownRoot;
  if (['build', 'verify', 'dev'].includes(command)) return nativeRun(root, command, rest);
  if (command === 'doctor') {
    const conf = JSON.parse(fs.readFileSync(path.join(root, 'platform.json'), 'utf8'));
    console.log(JSON.stringify({ root, node: process.version, backend: conf.backend, toolkitAvailable: !!toolkitEntry(), nativeLifecycleAvailable: true }, null, 2)); return;
  }
  if (command === 'help') { console.log('doctor | verify | build | dev（项目独立）；generate | derive | verify-generated | release | test-tools | sync-region-data | rename-foundation-tables（共享Skill）'); return; }
  const entry = toolkitEntry();
  if (!entry) throw new Error('未安装共享项目工具。安装jx-build-backend-module Skill，或设置JX_PLATFORM_TOOLKIT；原生build/verify/dev不受影响。');
  const tools = path.dirname(entry);
  if (command === 'test-tools') {
    const files = fs.readdirSync(path.join(tools, 'tests')).filter(n => n.endsWith('.test.mjs')).map(n => path.join(tools, 'tests', n));
    start({ executable: process.execPath, args: ['--test', ...files], cwd: root, env: { JX_PROJECT_ROOT: root } }); return;
  }
  const special = ['sync-region-data', 'rename-foundation-tables', 'verify-capabilities'].includes(command);
  const script = special ? path.join(tools, command + '.mjs') : entry;
  const forwarded = special ? [...rest, '--root', root] : [command === 'release' ? 'build' : command, ...rest, '--root', root];
  start({ executable: process.execPath, args: [script, ...forwarded], cwd: root, env: { JX_PROJECT_ROOT: root } });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
