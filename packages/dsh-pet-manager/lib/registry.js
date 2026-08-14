//#region src/registry.ts
/** Built-in providers known to the manager (extensible via dsh.plugin.categories). */
const BUILTIN_PET_PROVIDERS = [{
	entryId: "pet",
	displayName: {
		zh: "内置桌宠（鲸鱼娘）",
		en: "Built-in Pet (Whale Girl)"
	},
	settingsNamespace: "pet",
	toggleMode: "runtime"
}, {
	entryId: "whale-girl",
	displayName: {
		zh: "whale-girl",
		en: "whale-girl"
	},
	settingsNamespace: "whale-girl",
	toggleMode: "restart"
}];
function providerByEntryId(entryId) {
	return BUILTIN_PET_PROVIDERS.find((p) => p.entryId === entryId);
}
/** Normalize a manifest's toggle mode: only an explicit 'runtime' is live; anything else falls back to restart. */
function classifyToggleMode(manifest) {
	return manifest.toggleMode === "runtime" ? "runtime" : "restart";
}
const MANAGED_START = "# dsh-pet-manager managed section";
const MANAGED_END = "# end dsh-pet-manager managed section";
/** Parse the managed section into entryId -> disabled. */
function extractManagedEntries(text) {
	const map = /* @__PURE__ */ new Map();
	let inSection = false;
	let currentId = null;
	for (const raw of text.split(/\r?\n/)) {
		const line = raw.trim();
		if (line.startsWith(MANAGED_START)) {
			inSection = true;
			continue;
		}
		if (line.startsWith(MANAGED_END)) {
			inSection = false;
			continue;
		}
		if (!inSection) continue;
		const idMatch = /^-\s*id:\s*(\S+)\s*$/.exec(line);
		if (idMatch) {
			currentId = idMatch[1];
			continue;
		}
		const onMatch = /^disabled:\s*(true|false)\s*$/.exec(line);
		if (onMatch && currentId !== null) {
			map.set(currentId, onMatch[1] === "true");
			currentId = null;
		}
	}
	return map;
}
/** Set (or clear) one entry-level disabled flag inside the managed section. */
function applyManagedDisabled(text, entryId, disabled) {
	const entries = extractManagedEntries(text);
	entries.set(entryId, disabled);
	const body = [...entries].map(([id, on]) => [`- id: ${id}`, `  disabled: ${on}`]).flat();
	const section = [
		MANAGED_START,
		...body,
		MANAGED_END
	];
	const lines = text.split(/\r?\n/);
	const start = lines.findIndex((l) => l.trim().startsWith(MANAGED_START));
	if (start < 0) {
		const base = text.replace(/\s+$/, "");
		return base + (base === "" ? "" : "\n\n") + section.join("\n") + "\n";
	}
	const end = lines.findIndex((l) => l.trim().startsWith(MANAGED_END));
	const before = lines.slice(0, start);
	const after = end < 0 ? [] : lines.slice(end + 1);
	return [
		...before,
		...section,
		...after
	].join("\n") + "\n";
}
//#endregion
export { BUILTIN_PET_PROVIDERS, applyManagedDisabled, classifyToggleMode, extractManagedEntries, providerByEntryId };
