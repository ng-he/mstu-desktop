import type { EngineLoad } from '../../../preload'

type Props = {
  load: EngineLoad | null
  name: string
  nodes: number
  connectors: number
  running: boolean
  connected: boolean
  error: string | null
  onDismissError: () => void
  onToggleRun: () => void
}

const count = (many: number, noun: string): string => `${many} ${noun}${many === 1 ? '' : 's'}`

/// Bytes as a short string. Memory readings move, so the width is kept
/// steady rather than letting the toolbar jiggle.
const size = (bytes: number): string => {
  const mb = bytes / 1024 / 1024

  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`
}

function Toolbar(props: Props): JSX.Element {
  return (
    <header className="toolbar">
      <span className="title">{props.name}</span>
      <span className="meta">
        {count(props.nodes, 'node')} · {count(props.connectors, 'connector')}
      </span>

      {props.error && (
        <button className="toolbar-error" onClick={props.onDismissError} title="Dismiss">
          {props.error} ✕
        </button>
      )}

      <span className="spacer" />

      {props.load && (
        <span
          className="load"
          title={
            `The engine's own process. Processor is percent of one core, so two busy cores ` +
            `read as 200%. Of its memory, ${size(props.load.pipeline)} is what the pipeline ` +
            `holds in ${count(props.load.chunks, 'chunk')}.`
          }
        >
          <b>{props.load.cpu.toFixed(0)}%</b> cpu · <b>{size(props.load.memory)}</b> ram ·{' '}
          <b>{size(props.load.pipeline)}</b> in flight
        </span>
      )}

      {!props.connected && <span className="offline">engine offline</span>}

      {props.running ? (
        <button className="button danger" onClick={props.onToggleRun}>
          ■ Stop
        </button>
      ) : (
        <button className="button primary" onClick={props.onToggleRun} disabled={!props.connected}>
          ▶ Start
        </button>
      )}
    </header>
  )
}

export default Toolbar
