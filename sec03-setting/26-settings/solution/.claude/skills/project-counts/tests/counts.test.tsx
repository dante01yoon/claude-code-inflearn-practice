import { expect, test } from 'claude-code/testing'

const ROOT = '/proj/.claude'
const FILES: Record<string, string> = {
  [`${ROOT}/settings.json`]: JSON.stringify({
    hooks: {
      PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'a' }] }],
      PostToolUse: [
        { matcher: 'Write', hooks: [{ type: 'command', command: 'b' }, { type: 'command', command: 'c' }] },
      ],
    },
  }),
  [`${ROOT}/skills/web-page/SKILL.md`]: '',
}
const DIRS: Record<string, { name: string; kind: 'file' | 'dir' }[]> = {
  [`${ROOT}/skills`]: [
    { name: 'web-page', kind: 'dir' },
    { name: 'scratch', kind: 'dir' },
  ],
  [`${ROOT}/agents`]: [
    { name: 'reviewer.md', kind: 'file' },
    { name: 'notes.txt', kind: 'file' },
  ],
}

test('the band shows skills, agents and hooks counted from .claude', async ($, on) => {
  on('session.cwd', () => ({ value: '/proj' }))
  on('fs.exists', (_$, e) => ({ value: e.path in FILES }))
  on('fs.read', (_$, e) => {
    const text = FILES[e.path]
    if (text === undefined) return { deny: 'ENOENT' }
    return { value: text }
  })
  on('fs.list', (_$, e) => {
    const entries = DIRS[e.path]
    if (entries === undefined) return { deny: 'ENOENT' }
    return { value: entries.map(entry => ({ ...entry, size: 0, mtimeMs: 0, isLink: false })) }
  })

  on('session.start', () => ({ cwd: '/proj' }) as never)
  await $.session.start({ cwd: '/proj', surface: 'terminal', isInteractive: true } as never)

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({
      plugin: 'project-counts',
      surface,
      component: 'AbovePrompt',
      props: { hasSurvey: false, isWorking: false } as never,
    })
    expect((await ui.find({ type: 'Text' }))?.text).toBe('스킬 1 · 에이전트 1 · 훅 3')
    await ui.unmount()
  }
})
