/**
 * dsh-pet-manager client entry — registers the "宠物管理" card into the Web
 * UI plugin group. JSX-free entry (the preset bundles src/client/index.ts);
 * the card component lives in PetManagerCard.tsx.
 * @module @linxin666/dsh-pet-manager/client
 */

import { PetManagerCard, NS, copy } from './PetManagerCard.tsx'

export const name = 'pet-manager-client'

export const inject = ['slots', 'locale']

/** Register the card into the Web UI plugin group. */
export function apply(ctx: {
  effect<T>(fn: () => T | (() => void), name?: string): T
  slots: {
    inject(id: string, fn: () => unknown): unknown
    register(spec: { name: string; id: string; order: number; locale: string; inject: () => unknown; children?: Record<string, { kind: string; scope: string }> }, component: unknown): unknown
  }
  locale: { register(ns: string, dict: unknown): unknown }
}): void {
  ctx.effect(() => ctx.locale.register(NS, copy), 'pet-manager: dictionaries')
  ctx.slots.inject('web-ui.plugin.item', () => ctx.slots.register({
    name: 'web-ui.plugin.item',
    id: 'pet-manager',
    order: 150,
    locale: NS,
    children: { 'pet-manager.settings': { kind: 'list', scope: 'root' } },
    inject: () => ({}),
  }, PetManagerCard))
}
