# mstu-desktop

The desktop app for [mstu](https://github.com/ng-he/mstu): an Electron and React
canvas where pipelines are drawn, plugins are wired field to field, and each
plugin's own page runs in the node that holds it.

```sh
npm install
npm run dev
```

It connects to a running engine over `$XDG_RUNTIME_DIR/mstu.sock` and reconnects
on its own, so the engine can come and go underneath it.
