/** Toggle semantics for one pet provider. */
export type ToggleMode = 'runtime' | 'restart';
/** Descriptor of one pet provider (a loader entry that renders a pet). */
export interface PetProviderManifest {
    entryId: string;
    displayName: {
        zh: string;
        en: string;
    };
    settingsNamespace: string;
    toggleMode: ToggleMode;
    /** Settings fields set on a runtime toggle (default ['enabled']). */
    runtimeToggleFields?: string[];
}
/** Built-in providers known to the manager (extensible via dsh.plugin.categories). */
export declare const BUILTIN_PET_PROVIDERS: readonly PetProviderManifest[];
export declare function providerByEntryId(entryId: string): PetProviderManifest | undefined;
/** Normalize a manifest's toggle mode: only an explicit 'runtime' is live; anything else falls back to restart. */
export declare function classifyToggleMode(manifest: PetProviderManifest): ToggleMode;
/** Parse the managed section into entryId -> disabled. */
export declare function extractManagedEntries(text: string): Map<string, boolean>;
/** Set (or clear) one entry-level disabled flag inside the managed section. */
export declare function applyManagedDisabled(text: string, entryId: string, disabled: boolean): string;
//# sourceMappingURL=registry.d.ts.map