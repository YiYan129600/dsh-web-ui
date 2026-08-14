# dsh-pet-manager

English | [中文](README.zh.md)

Pet manager for DSH Web: list every pet provider, toggle each independently
(multi-select), and expand each to see the configuration its own plugin
registers (settings namespace schema + values).

## Install

Ships with `@linxin666/dsh-web-ui-all`; or install standalone:

```sh
dsh plugin --profile <name> add @linxin666/dsh-pet-manager
```

## Usage

Open 设置 → 插件 → Web UI 插件 → 宠物管理. Each pet is one row:

- 是否开启 checkbox (independent, multi-select).
- Expand (▾) shows the pet plugin's own settings-namespace data.
- `live` toggles apply immediately; `restart` toggles write a managed
  section into your profile's `cordis.patch.yml` and show a
  "restart DSH to apply" hint.

## Provider convention

A pet provider is identified by its loader entry id with a settings
namespace and a toggle mode:

- `runtime` — has an `enabled`/`visible` settings field and reacts live
  (the built-in `pet`).
- `restart` — third-party pets without a runtime switch (e.g. `whale-girl`);
  toggling writes `disabled` for that entry and requires a restart.

Built-in providers: `pet` (runtime), `whale-girl` (restart). Extendable:
plugins declaring `dsh.plugin.categories` containing `pet` are candidates.

## Known limitations

- Restart-mode toggles take effect only after a DSH restart (disclosed by
  the panel's hint).
- The dropdown renders schema fields read-only in this version; editing
  flows through each pet's own settings surface.

## Development

```sh
pnpm install
pnpm test
pnpm typecheck
```

## License

Apache-2.0
