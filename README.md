# mstu-desktop

The desktop app for [mstu](https://github.com/ng-he/mstu): an Electron and React
canvas where pipelines are drawn, plugins are wired field to field, and each
plugin's own page runs in the node that holds it.

```sh
npm install
npm run dev
```

```sh
npm run package
```

Packages the app for whatever platform it is run on, into `dist/`: an AppImage
and a deb on Linux. The SDK a plugin's page loads is
read from `resources/sdk` at runtime through a path relative to `out/main`, so
both folders go into the asar and nothing in the code has to know whether it
is packaged. The deb carries a maintainer address, set in `electron-builder.yml`, which
goes out in every package.

The icon is `build/icon.png`, drawn by `build/icon.py`: one node fanning out
to two, in the three role colours the canvas uses -- source, transform, sink --
over links in the colour a link rests at. Rounded squares rather than circles,
because that is how the app marks a role and because a square keeps more of
itself at sixteen pixels. Run the script to change it; electron builder makes
every size it needs from that one file.

It connects to a running engine over `$XDG_RUNTIME_DIR/mstu.sock`, or
`\\.\pipe\mstu` on Windows, and reconnects on its own, so the engine can come
and go underneath it. `MSTU_SOCKET` names another one, which is how a second
engine is talked to; set it the same for both.

## The UI SDK

A plugin can bring its own page, and this app hosts it. Any plugin may use the
SDK below, in any language the plugin itself is written in: the page is plain
HTML, CSS and JavaScript, and nothing about it is tied to Rust.

A plugin's `ui()` returns a folder name. The folder is served under an origin of
the plugin's own, and `index.html` is mounted in a shadow root inside the node
on the canvas, so the page's styles cannot reach the rest of the app and the
app's cannot reach the page.

```html
<link rel="stylesheet" href="./_sdk/mstu.css" />

<div class="mstu-status">
  <span class="mstu-dot" id="dot"></span>
  <span class="mstu-count" id="size">0 B</span>
</div>

<script type="module" src="./index.js"></script>
```

The script is a module whose default export is called with the page's handle.
It may be async, and may return a cleanup that runs when the page goes away:

```js
import { humanSize } from './_sdk/mstu.js'

export default function mount(plugin) {
  plugin.onLive(({ bytes }) => (plugin.el('size').textContent = humanSize(bytes)))
  plugin.onState(({ running }) => plugin.el('dot').classList.toggle('on', running))

  plugin.el('browse').addEventListener('click', () => plugin.pick('path', { kind: 'file' }))

  return () => {}
}
```

Settings, commands and events are addressed by the names in the plugin's own
schemas, which the engine describes to the app:

| | |
| --- | --- |
| `settings`, `schemas` | what the plugin takes, publishes and answers |
| `set(name, value)`, `pick(name, {kind})` | write a setting through to the plugin |
| `invoke(name, payload)` | call one of its commands |
| `onLive`, `onEvent(name, …)` | readings as they move, events as they are raised |
| `onState`, `onSettings`, `onPopup` | also called right away with the current value |
| `fit(width)`, `resize(width, height)` | ask for the box the page needs |
| `popup(page, options)`, `closePopup()` | a second page floating over the canvas |
| `mediaUrl(path)` | a local file served to the page, which cannot load `file://` |
| `el(id)`, `root` | the page's own elements |

`_sdk/mstu.css` carries the base styles, whose classes are prefixed `mstu-`, so
a plugin page looks like the rest of the app without copying anything.
`_sdk/mstu.js` carries the helpers, and documents the whole surface at the top
of the file.

Keep state inside `mount()`: it runs again each time the page is shown.
