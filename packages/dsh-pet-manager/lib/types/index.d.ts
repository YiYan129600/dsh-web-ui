/**
 * dsh-pet-manager host half — the `petManager` service + /api/pet-manager/*.
 * Lists every pet provider (built-in manifest, extensible via
 * `dsh.plugin.categories` containing "pet"), toggles runtime-mode pets
 * through their settings namespace live, and records restart-mode pets'
 * entry-level `disabled` flags in the profile's own cordis.patch.yml
 * (managed section) with restartRequired surfaced to the UI.
 * @module @linxin666/dsh-pet-manager
 */
import { Context, Service } from '@deepseek-ai/cordis';
/** Stable cordis plugin name (matches cordis.patch.yml insert id). */
export declare const name = "pet-manager";
/** Services required before the manager can mount its surfaces. */
export declare const inject: string[];
/** Route prefix (same-origin, loopback-only). */
export declare const PET_MANAGER_PREFIX = "/api/pet-manager";
/** One provider as the client sees it. */
export interface PetManagerProviderView {
    entryId: string;
    name: {
        zh: string;
        en: string;
    };
    namespace: string;
    toggleMode: 'runtime' | 'restart';
    enabled: boolean;
    restartRequired: boolean;
}
/** Cordis service exposing the pet-manager RPC domain. */
export declare class PetManagerService extends Service {
    static inject: string[];
    private readonly profilePatch;
    constructor(ctx: Context);
    private settings;
    private readPatch;
    list(): PetManagerProviderView[];
    private runtimeEnabled;
    /** Toggle a provider. Runtime mode mutates its settings namespace (live); restart mode writes the managed patch section. */
    setEnabled(entryId: string, enabled: boolean): Promise<{
        ok: true;
        restartRequired: boolean;
        enabled: boolean;
    } | {
        ok: false;
        error: string;
    }>;
    /** Namespace view for a provider's dropdown (schema + value + revision). */
    describe(namespace: string): Promise<{
        ok: true;
        value: unknown;
    } | {
        ok: false;
        error: string;
    }>;
}
/** Register the manager service and its loopback-only HTTP routes. */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map