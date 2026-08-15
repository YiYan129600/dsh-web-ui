/**
 * Pet manager card UI. Renders every pet provider with an independent
 * "是否开启" checkbox and an expandable body fed by that provider's own
 * settings namespace (schema + current value from the host). Runtime-mode
 * toggles apply live; restart-mode toggles surface a "需重启生效" banner.
 * @module @linxin666/dsh-pet-manager/client
 */
import { type ReactElement } from 'react';
import type { PropsRenderSlots } from '@deepseek-ai/dsh-client-ui-slots';
export declare const NS = "pet-manager";
export declare const copy: {
    zh: {
        title: string;
        description: string;
        enable: string;
        restartHint: string;
        expand: string;
        collapse: string;
        noProviders: string;
        error: string;
    };
    en: {
        title: string;
        description: string;
        enable: string;
        restartHint: string;
        expand: string;
        collapse: string;
        noProviders: string;
        error: string;
    };
};
/** The pet manager card. */
export declare function PetManagerCard(props: {
    t: (k: string) => string;
    renderSlot: PropsRenderSlots<'pet-manager.settings'>['renderSlot'];
}): ReactElement;
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'web-ui.plugin.item': {
            kind: 'list';
            scope: 'root';
            owner: {
                children?: never;
            };
        };
        'pet-manager.settings': {
            kind: 'list';
            scope: 'root';
            owner: {
                children?: never;
            };
        };
    }
}
//# sourceMappingURL=PetManagerCard.d.ts.map