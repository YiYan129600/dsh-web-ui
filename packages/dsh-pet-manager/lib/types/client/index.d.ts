/**
 * dsh-pet-manager client entry — registers the "宠物管理" card into the Web
 * UI plugin group. JSX-free entry (the preset bundles src/client/index.ts);
 * the card component lives in PetManagerCard.tsx.
 * @module @linxin666/dsh-pet-manager/client
 */
export declare const name = "pet-manager-client";
export declare const inject: string[];
/** Register the card into the Web UI plugin group. */
export declare function apply(ctx: {
    effect<T>(fn: () => T | (() => void), name?: string): T;
    slots: {
        inject(id: string, fn: () => unknown): unknown;
        register(spec: {
            name: string;
            id: string;
            order: number;
            locale: string;
            inject: () => unknown;
        }, component: unknown): unknown;
    };
    locale: {
        register(ns: string, dict: unknown): unknown;
    };
}): void;
//# sourceMappingURL=index.d.ts.map