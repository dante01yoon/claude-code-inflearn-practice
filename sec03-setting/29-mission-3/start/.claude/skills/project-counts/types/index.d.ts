export type Counts = { skills: number; agents: number; hooks: number }

declare module 'claude-code' {
  interface PluginState {
    'project-counts': { counts: Counts | null }
  }
}
