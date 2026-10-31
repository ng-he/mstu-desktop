import { contextBridge, ipcRenderer } from 'electron'

export type EngineEvent = {
  type: 'event'
  plugin: string
  event: number
  values: unknown[]
}

/// A plugin's live snapshot, pushed on the engine's timer.
export type EngineLive = {
  type: 'live'
  plugin: string
  values: unknown[]
}

/// What the engine is costing the machine, pushed on its own slow beat.
export type EngineLoad = {
  type: 'load'
  /// Percent of one core, so two busy cores read as 200.
  cpu: number
  /// Resident memory of the engine, in bytes.
  memory: number
  /// Of that, what the pipeline holds in message arenas.
  pipeline: number
  chunks: number
}

/// Everything the renderer may call. Nothing else crosses the bridge.
const api = {
  call: <T = unknown,>(method: string, params: unknown = {}): Promise<T> =>
    ipcRenderer.invoke('mstu:call', method, params) as Promise<T>,

  connected: (): Promise<boolean> => ipcRenderer.invoke('mstu:connected'),

  socket: (): Promise<string> => ipcRenderer.invoke('mstu:socket'),

  pick: (kind: 'file' | 'directory'): Promise<string | null> =>
    ipcRenderer.invoke('mstu:pick', kind),

  onEvent: (listener: (event: EngineEvent) => void): (() => void) => {
    const handler = (_: unknown, payload: EngineEvent): void => listener(payload)
    ipcRenderer.on('mstu:event', handler)

    return () => ipcRenderer.removeListener('mstu:event', handler)
  },

  onLive: (listener: (live: EngineLive) => void): (() => void) => {
    const handler = (_: unknown, payload: EngineLive): void => listener(payload)
    ipcRenderer.on('mstu:live', handler)

    return () => ipcRenderer.removeListener('mstu:live', handler)
  },

  onLoad: (listener: (load: EngineLoad) => void): (() => void) => {
    const handler = (_: unknown, payload: EngineLoad): void => listener(payload)
    ipcRenderer.on('mstu:load', handler)

    return () => ipcRenderer.removeListener('mstu:load', handler)
  },

  onStatus: (listener: (connected: boolean) => void): (() => void) => {
    const handler = (_: unknown, connected: boolean): void => listener(connected)
    ipcRenderer.on('mstu:status', handler)

    return () => ipcRenderer.removeListener('mstu:status', handler)
  }
}

export type Api = typeof api

contextBridge.exposeInMainWorld('mstu', api)
