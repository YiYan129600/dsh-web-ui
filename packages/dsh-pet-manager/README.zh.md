# dsh-pet-manager

[English](README.md) | 中文

DSH Web 宠物管理面板：列出所有桌宠 provider，每只可独立启用（多选），展开可见
各插件自己注册的配置（settings 命名空间 schema 与值）。

## 安装

随 `@linxin666/dsh-web-ui-all` 聚合安装；也可单独安装：

```sh
dsh plugin --profile <name> add @linxin666/dsh-pet-manager
```

## 使用

设置 → 插件 → Web UI 插件 → 宠物管理。每只宠物一行：

- 「是否开启」勾选（独立、可多选）。
- 展开（▾）显示该宠物插件自己注册的 settings 命名空间数据。
- `live` 开关即时生效；`restart` 开关写入你 profile 的 `cordis.patch.yml`
  受管区段并提示「重启后生效」。

## Provider 约定

宠物 provider 由 loader entry id 标识，含 settings 命名空间与开关模式：

- `runtime` — 有 `enabled`/`visible` 设置字段且即时生效（内置 `pet`）。
- `restart` — 无运行时开关的第三方宠物（如 `whale-girl`）；切换写入该 entry
  的 `disabled` 并需重启。

内置 provider：`pet`（runtime）、`whale-girl`（restart）。可扩展：声明
`dsh.plugin.categories` 含 `pet` 的插件为候选。

## 已知限制

- restart 模式的开关需重启 DSH 后生效（面板会提示）。
- 本版本下拉以只读方式展示 schema 字段；编辑走各宠物自己的设置面。

## 开发

```sh
pnpm install
pnpm test
pnpm typecheck
```

## License

Apache-2.0
