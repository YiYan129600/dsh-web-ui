import { BUILTIN_PET_PROVIDERS, applyManagedDisabled, extractManagedEntries } from "./registry.js";
import { Service } from "@deepseek-ai/cordis";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
//#region src/index.ts
/**
* dsh-pet-manager host half — the `petManager` service + /api/pet-manager/*.
* Lists every pet provider (built-in manifest, extensible via
* `dsh.plugin.categories` containing "pet"), toggles runtime-mode pets
* through their settings namespace live, and records restart-mode pets'
* entry-level `disabled` flags in the profile's own cordis.patch.yml
* (managed section) with restartRequired surfaced to the UI.
* @module @linxin666/dsh-pet-manager
*/
/** Stable cordis plugin name (matches cordis.patch.yml insert id). */
const name = "pet-manager";
/** Services required before the manager can mount its surfaces. */
const inject = ["settings", "webServer"];
/** Route prefix (same-origin, loopback-only). */
const PET_MANAGER_PREFIX = "/api/pet-manager";
/** Profile patch file the managed section lives in. */
const PROFILE_PATCH_FILE = "cordis.patch.yml";
function isLoopbackRequest(req) {
	const address = req.socket.remoteAddress;
	if (address !== "127.0.0.1" && address !== "::1" && address !== "::ffff:127.0.0.1") return false;
	const host = req.headers.host;
	if (typeof host !== "string") return false;
	let hostUrl;
	try {
		hostUrl = new URL("http://" + host);
	} catch {
		return false;
	}
	return hostUrl.hostname === "127.0.0.1" || hostUrl.hostname === "localhost" || hostUrl.hostname === "[::1]";
}
function writeJson(res, status, body) {
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"referrer-policy": "no-referrer"
	});
	res.end(JSON.stringify(body));
}
/** Resolve the active profile's cordis.patch.yml from the loader baseUrl. */
function resolveProfilePatch(ctx) {
	const base = typeof ctx.baseUrl === "string" ? ctx.baseUrl : "";
	let dir;
	try {
		dir = base.startsWith("file:") ? fileURLToPath(base) : base;
	} catch {
		dir = base;
	}
	return join(dir, PROFILE_PATCH_FILE);
}
/** Cordis service exposing the pet-manager RPC domain. */
var PetManagerService = class extends Service {
	static inject = ["settings"];
	profilePatch;
	constructor(ctx) {
		super(ctx, "petManager");
		this.profilePatch = resolveProfilePatch(ctx);
	}
	settings() {
		return this.ctx.get("settings", false);
	}
	readPatch() {
		try {
			return readFileSync(this.profilePatch, "utf8");
		} catch {
			return "";
		}
	}
	list() {
		const settings = this.settings();
		const registered = new Set(settings ? settings.describe({ redactSecrets: true }).map((d) => String(d.ns)) : []);
		return BUILTIN_PET_PROVIDERS.map((provider) => {
			const enabled = provider.toggleMode === "runtime" ? this.runtimeEnabled(provider) : !(extractManagedEntries(this.readPatch()).get(provider.entryId) ?? false);
			return {
				entryId: provider.entryId,
				name: provider.displayName,
				namespace: provider.settingsNamespace,
				toggleMode: provider.toggleMode,
				enabled,
				restartRequired: provider.toggleMode === "restart",
				...registered.has(provider.settingsNamespace) ? {} : { registered: false }
			};
		});
	}
	runtimeEnabled(provider) {
		const settings = this.settings();
		if (!settings) return true;
		const value = settings.describe({ redactSecrets: true }).find((d) => String(d.ns) === provider.settingsNamespace)?.value;
		if (value && typeof value === "object") {
			const record = value;
			if (typeof record.enabled === "boolean") return record.enabled;
			if (typeof record.visible === "boolean") return record.visible;
		}
		return true;
	}
	/** Toggle a provider. Runtime mode mutates its settings namespace (live); restart mode writes the managed patch section. */
	async setEnabled(entryId, enabled) {
		const provider = BUILTIN_PET_PROVIDERS.find((p) => p.entryId === entryId);
		if (!provider) return {
			ok: false,
			error: "unknown-provider"
		};
		if (provider.toggleMode === "runtime") {
			const settings = this.settings();
			if (!settings) return {
				ok: false,
				error: "settings-unavailable"
			};
			try {
				await settings.mutate(settingsNamespace(provider.settingsNamespace), [{
					op: "set",
					path: ["enabled"],
					value: enabled
				}]);
			} catch (error) {
				return {
					ok: false,
					error: error instanceof Error ? error.message : String(error)
				};
			}
			return {
				ok: true,
				restartRequired: false,
				enabled
			};
		}
		const next = applyManagedDisabled(this.readPatch(), entryId, !enabled);
		writeFileSync(this.profilePatch, next);
		return {
			ok: true,
			restartRequired: true,
			enabled
		};
	}
	/** Namespace view for a provider's dropdown (schema + value + revision). */
	async describe(namespace) {
		const settings = this.settings();
		if (!settings) return {
			ok: false,
			error: "settings-unavailable"
		};
		const descriptor = settings.describe({ redactSecrets: true }).find((d) => String(d.ns) === namespace);
		if (!descriptor) return {
			ok: false,
			error: "namespace-not-registered"
		};
		return {
			ok: true,
			value: {
				ns: String(descriptor.ns),
				schema: descriptor.schema,
				value: descriptor.value,
				revision: descriptor.revision
			}
		};
	}
};
/** Register the manager service and its loopback-only HTTP routes. */
function apply(ctx) {
	const service = new PetManagerService(ctx);
	const guard = (req, res) => {
		if (!isLoopbackRequest(req)) {
			writeJson(res, 403, {
				ok: false,
				error: "loopback requests only"
			});
			return false;
		}
		return true;
	};
	const json = (res, status, body) => writeJson(res, status, body);
	const routes = [
		{
			kind: "exact",
			path: "/api/pet-manager/list",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				json(res, 200, {
					ok: true,
					value: service.list()
				});
			}
		},
		{
			kind: "exact",
			path: "/api/pet-manager/setEnabled",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				if (req.method !== "POST") {
					json(res, 405, {
						ok: false,
						error: "method not allowed"
					});
					return;
				}
				let body;
				try {
					body = JSON.parse(await readBody(req));
				} catch {
					json(res, 400, {
						ok: false,
						error: "invalid JSON body"
					});
					return;
				}
				const { entryId, enabled } = body ?? {};
				if (typeof entryId !== "string" || typeof enabled !== "boolean") {
					json(res, 400, {
						ok: false,
						error: "malformed request"
					});
					return;
				}
				json(res, 200, await service.setEnabled(entryId, enabled));
			}
		},
		{
			kind: "exact",
			path: "/api/pet-manager/describe",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				const namespace = new URL(req.url ?? "/", "http://dsh.internal").searchParams.get("ns") ?? "";
				json(res, 200, await service.describe(namespace));
			}
		}
	];
	ctx.effect(() => {
		const disposers = routes.map((route) => ctx.webServer.register(route));
		return () => {
			for (const dispose of disposers) dispose();
		};
	}, "pet-manager: routes");
}
async function readBody(req) {
	const chunks = [];
	for await (const chunk of req) chunks.push(chunk);
	return Buffer.concat(chunks).toString("utf8");
}
//#endregion
export { PET_MANAGER_PREFIX, PetManagerService, apply, inject, name };
