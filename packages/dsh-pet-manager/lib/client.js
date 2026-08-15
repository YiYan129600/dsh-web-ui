window.__ModuleLoader__.load({
	id: "@linxin666/dsh-pet-manager",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/PetManagerCard.tsx
		/**
		* Pet manager card UI. Renders every pet provider with an independent
		* "是否开启" checkbox and an expandable body fed by that provider's own
		* settings namespace (schema + current value from the host). Runtime-mode
		* toggles apply live; restart-mode toggles surface a "需重启生效" banner.
		* @module @linxin666/dsh-pet-manager/client
		*/
		const NS = "pet-manager";
		const copy = {
			zh: {
				title: "宠物管理",
				description: "每只宠物独立开关，展开查看各插件提供的配置",
				enable: "是否开启",
				restartHint: "已写入配置，重启 DSH 后生效",
				expand: "展开",
				collapse: "收起",
				noProviders: "未发现宠物插件",
				error: "加载失败"
			},
			en: {
				title: "Pet Manager",
				description: "Toggle every pet independently; expand for plugin-provided config",
				enable: "Enabled",
				restartHint: "Config written; restart DSH to apply",
				expand: "Expand",
				collapse: "Collapse",
				noProviders: "No pet plugins found",
				error: "Failed to load"
			}
		};
		const API = "/api/pet-manager";
		async function api(path, init) {
			const res = await fetch(API + path, init);
			if (!res.ok) throw new Error(String(res.status));
			return await res.json();
		}
		function schemaRows(schema, value) {
			const s = schema;
			if (!s) return [];
			const root = s.uid !== void 0 && s.refs ? s.refs[s.uid] ?? s : s;
			const record = value ?? {};
			if (root.type === "object" && root.dict) return Object.entries(root.dict).map(([key, refId]) => {
				const meta = (typeof refId === "number" ? s.refs?.[refId] : void 0)?.meta ?? {};
				return {
					key,
					label: key,
					value: String(record[key] ?? ("default" in meta ? String(meta.default) : ""))
				};
			});
			if (root.properties) {
				const props = root.properties;
				return Object.entries(props).map(([key, prop]) => ({
					key,
					label: prop.title ?? prop.description ?? key,
					value: String(record[key] ?? "")
				}));
			}
			return [];
		}
		/** The pet manager card. */
		function PetManagerCard(props) {
			const t = (key) => props.t(key) || copy.zh[key] || key;
			const [providers, setProviders] = (0, react.useState)(null);
			const [openId, setOpenId] = (0, react.useState)(null);
			const [describes, setDescribes] = (0, react.useState)({});
			const [hint, setHint] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const load = () => {
				api("/list").then((r) => {
					if (r.ok) setProviders(r.value);
				}, () => setError(t("error")));
			};
			(0, react.useEffect)(load, []);
			const toggle = (provider) => {
				api("/setEnabled", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						entryId: provider.entryId,
						enabled: !provider.enabled
					})
				}).then((r) => {
					if (r.ok) {
						if (r.restartRequired) setHint(t("restartHint"));
						load();
					}
				}, () => setError(t("error")));
			};
			const expand = (provider) => {
				const next = openId === provider.entryId ? null : provider.entryId;
				setOpenId(next);
				if (next !== null && describes[provider.entryId] === void 0) api("/describe?ns=" + encodeURIComponent(provider.namespace)).then((r) => {
					if (r.ok && r.value) setDescribes((prev) => ({
						...prev,
						[provider.entryId]: r.value
					}));
				}, () => setError(t("error")));
			};
			if (error !== null) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: {
					padding: 12,
					color: "#e06c75"
				},
				children: error
			});
			const list = providers ?? [];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: { padding: "8px 4px" },
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							fontWeight: 600,
							marginBottom: 4
						},
						children: t("title")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							opacity: .7,
							marginBottom: 8
						},
						children: t("description")
					}),
					hint !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							padding: "6px 10px",
							marginBottom: 8,
							borderRadius: 6,
							background: "#ffd75e33",
							border: "1px solid #ffd75e66",
							fontSize: 12
						},
						children: hint
					}) : null,
					list.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							fontSize: 12,
							opacity: .6
						},
						children: t("noProviders")
					}) : null,
					list.map((provider) => {
						const open = openId === provider.entryId;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: { borderTop: "1px solid #8882" },
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: 8,
									padding: "6px 4px"
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: 6,
											cursor: "pointer"
										},
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: provider.enabled,
											onChange: () => toggle(provider),
											"aria-label": `${t("enable")}: ${provider.name.zh}`
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: provider.name.zh })]
									}),
									provider.restartRequired ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: {
											fontSize: 11,
											opacity: .6,
											border: "1px solid #8884",
											borderRadius: 4,
											padding: "0 6px"
										},
										children: "restart"
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: {
											fontSize: 11,
											opacity: .5
										},
										children: "live"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-expanded": open,
										"aria-label": `${t(open ? "collapse" : "expand")}: ${provider.name.zh}`,
										onClick: () => expand(provider),
										style: {
											marginLeft: "auto",
											border: 0,
											background: "none",
											cursor: "pointer",
											fontSize: 12
										},
										children: open ? "▴" : "▾"
									})
								]
							}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								style: {
									padding: "6px 12px",
									borderTop: "1px solid #8882",
									fontSize: 12
								},
								children: describes[provider.entryId] === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: { opacity: .6 },
									children: "…"
								}) : schemaRows(describes[provider.entryId].schema, describes[provider.entryId].value).map((field) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										gap: 12,
										padding: "3px 0"
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										style: { opacity: .7 },
										children: field.label
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: field.value || "—" })]
								}, field.key))
							}) : null]
						}, provider.entryId);
					})
				]
			});
		}
		//#endregion
		//#region src/client/index.ts
		/**
		* dsh-pet-manager client entry — registers the "宠物管理" card into the Web
		* UI plugin group. JSX-free entry (the preset bundles src/client/index.ts);
		* the card component lives in PetManagerCard.tsx.
		* @module @linxin666/dsh-pet-manager/client
		*/
		const name = "pet-manager-client";
		const inject = ["slots", "locale"];
		/** Register the card into the Web UI plugin group. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, copy), "pet-manager: dictionaries");
			ctx.slots.inject("web-ui.plugin.item", () => ctx.slots.register({
				name: "web-ui.plugin.item",
				id: "pet-manager",
				order: 150,
				locale: NS,
				inject: () => ({})
			}, PetManagerCard));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map