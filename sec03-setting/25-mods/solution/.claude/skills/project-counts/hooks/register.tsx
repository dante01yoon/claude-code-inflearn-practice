import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Counts } from '../types'

const counts = atom({ plugin: 'project-counts', key: 'counts' } as const, null)

const SETTINGS = ['settings.json', 'settings.local.json']

async function listOrEmpty($: EngineInterface, path: string) {
  return $.fs.list(path).catch(() => [])
}

async function countSkills($: EngineInterface, root: string) {
  const entries = await listOrEmpty($, `${root}/skills`)
  const dirs = entries.filter(entry => entry.kind !== 'file')
  const found = await Promise.all(
    dirs.map(dir => $.fs.exists(`${root}/skills/${dir.name}/SKILL.md`)),
  )

  return found.filter(Boolean).length
}

async function countAgents($: EngineInterface, root: string) {
  const entries = await listOrEmpty($, `${root}/agents`)

  return entries.filter(entry => entry.name.endsWith('.md')).length
}

// Every handler under every event's matcher groups, in both project settings files.
async function countHooks($: EngineInterface, root: string) {
  let total = 0
  for (const name of SETTINGS) {
    const text = await $.fs.read(`${root}/${name}`).catch(() => undefined)
    if (typeof text !== 'string') continue
    try {
      const events = JSON.parse(text)?.hooks ?? {}
      for (const groups of Object.values(events)) {
        if (!Array.isArray(groups)) continue
        for (const group of groups) {
          total += Array.isArray(group?.hooks) ? group.hooks.length : 0
        }
      }
    } catch {
      // A settings file that does not parse adds nothing.
    }
  }

  return total
}

async function refresh($: EngineInterface) {
  const root = `${await $.session.cwd()}/.claude`
  const [skills, agents, hooks] = await Promise.all([
    countSkills($, root),
    countAgents($, root),
    countHooks($, root),
  ])
  const next: Counts = { skills, agents, hooks }
  await update($, counts, () => next)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await refresh($)

    return next(e)
  })

  // Files may have changed during the turn (a new skill, a new hook).
  on('turn.complete', async ($, e, next) => {
    await refresh($)

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const current = await read($, counts)
    if (e.props.hasSurvey || current === null) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box>
        <Text dimColor>
          스킬 {current.skills} · 에이전트 {current.agents} · 훅 {current.hooks}
        </Text>
      </Box>
    )
  })
}
