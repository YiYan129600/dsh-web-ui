/**
 * Pet manager card UI. Renders every pet provider with an independent
 * "是否开启" checkbox and an expandable body fed by that provider's own
 * settings namespace (schema + current value from the host). Runtime-mode
 * toggles apply live; restart-mode toggles surface a "需重启生效" banner.
 * @module @linxin666/dsh-pet-manager/client
 */

import { useEffect, useState, type ReactElement } from 'react'
import type { PropsRenderSlots } from '@deepseek-ai/dsh-client-ui-slots'

export const NS = 'pet-manager'

export const copy = {
  zh: {
    title: '宠物管理',
    description: '每只宠物独立开关，展开查看各插件提供的配置',
    enable: '是否开启',
    restartHint: '已写入配置，重启 DSH 后生效',
    expand: '展开',
    collapse: '收起',
    noProviders: '未发现宠物插件',
    error: '加载失败',
  },
  en: {
    title: 'Pet Manager',
    description: 'Toggle every pet independently; expand for plugin-provided config',
    enable: 'Enabled',
    restartHint: 'Config written; restart DSH to apply',
    expand: 'Expand',
    collapse: 'Collapse',
    noProviders: 'No pet plugins found',
    error: 'Failed to load',
  },
}

interface ProviderView {
  entryId: string
  name: { zh: string; en: string }
  namespace: string
  toggleMode: 'runtime' | 'restart'
  enabled: boolean
  restartRequired: boolean
}

interface DescribeView { ns: string; schema: unknown; value: unknown; revision: number }

const API = '/api/pet-manager'

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API + path, init)
  if (!res.ok) throw new Error(String(res.status))
  return (await res.json()) as T
}

function schemaRows(schema: unknown, value: unknown): Array<{ key: string; label: string; value: string }> {
  const s = schema as { uid?: number; type?: string; dict?: Record<string, unknown>; properties?: Record<string, { title?: string; description?: string }>; refs?: Record<string, { meta?: Record<string, unknown> }> } | null
  if (!s) return []
  // schemastery serializes the root as a uid reference into refs; resolve it.
  const root: any = s.uid !== undefined && s.refs ? (s.refs[s.uid] ?? s) : s
  const record = (value ?? {}) as Record<string, unknown>
  if (root.type === 'object' && root.dict) {
    return Object.entries(root.dict).map(([key, refId]) => {
      const prop: any = typeof refId === 'number' ? s.refs?.[refId] : undefined
      const meta: Record<string, unknown> = prop?.meta ?? {}
      return { key, label: key, value: String(record[key] ?? ('default' in meta ? String(meta.default) : '')) }
    })
  }
  if (root.properties) {
    const props = root.properties as Record<string, { title?: string; description?: string }>
    return Object.entries(props).map(([key, prop]) => ({
      key,
      label: prop.title ?? prop.description ?? key,
      value: String(record[key] ?? ''),
    }))
  }
  return []
}

/** The pet manager card. */
export function PetManagerCard(props: { t: (k: string) => string }): ReactElement {
  const t = (key: string) => props.t(key) || copy.zh[key as keyof typeof copy.zh] || key
  const [providers, setProviders] = useState<ProviderView[] | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [describes, setDescribes] = useState<Record<string, DescribeView>>({})
  const [hint, setHint] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = (): void => {
    api<{ ok: boolean; value: ProviderView[] }>('/list').then((r) => {
      if (r.ok) setProviders(r.value)
    }, () => setError(t('error')))
  }

  useEffect(load, [])

  const toggle = (provider: ProviderView): void => {
    api<{ ok: boolean; restartRequired?: boolean }>('/setEnabled', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ entryId: provider.entryId, enabled: !provider.enabled }),
    }).then((r) => {
      if (r.ok) {
        if (r.restartRequired) setHint(t('restartHint'))
        load()
      }
    }, () => setError(t('error')))
  }

  const expand = (provider: ProviderView): void => {
    const next = openId === provider.entryId ? null : provider.entryId
    setOpenId(next)
    if (next !== null && describes[provider.entryId] === undefined) {
      api<{ ok: boolean; value?: DescribeView }>('/describe?ns=' + encodeURIComponent(provider.namespace)).then((r) => {
        if (r.ok && r.value) setDescribes((prev) => ({ ...prev, [provider.entryId]: r.value! }))
      }, () => setError(t('error')))
    }
  }

  if (error !== null) return <div style={{ padding: 12, color: '#e06c75' }}>{error}</div>

  const list = providers ?? []
  return (
    <div style={{ padding: '8px 4px' }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('title')}</div>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>{t('description')}</div>
      {hint !== null
        ? <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 6, background: '#ffd75e33', border: '1px solid #ffd75e66', fontSize: 12 }}>{hint}</div>
        : null}
      {list.length === 0 ? <div style={{ fontSize: 12, opacity: 0.6 }}>{t('noProviders')}</div> : null}
      {list.map((provider) => {
        const open = openId === provider.entryId
        const row = (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={provider.enabled}
                onChange={() => toggle(provider)}
                aria-label={`${t('enable')}: ${provider.name.zh}`}
              />
              <span>{provider.name.zh}</span>
            </label>
            {provider.restartRequired
              ? <span style={{ fontSize: 11, opacity: 0.6, border: '1px solid #8884', borderRadius: 4, padding: '0 6px' }}>restart</span>
              : <span style={{ fontSize: 11, opacity: 0.5 }}>live</span>}
            <button
              type="button"
              aria-expanded={open}
              aria-label={`${t(open ? 'collapse' : 'expand')}: ${provider.name.zh}`}
              onClick={() => expand(provider)}
              style={{ marginLeft: 'auto', border: 0, background: 'none', cursor: 'pointer', fontSize: 12 }}
            >
              {open ? '▴' : '▾'}
            </button>
          </div>
        )
        const body = open ? (
          <div style={{ padding: '6px 12px', borderTop: '1px solid #8882', fontSize: 12 }}>
            {describes[provider.entryId] === undefined
              ? <span style={{ opacity: 0.6 }}>…</span>
              : schemaRows(describes[provider.entryId].schema, describes[provider.entryId].value).map((field) => (
                <div key={field.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '3px 0' }}>
                  <span style={{ opacity: 0.7 }}>{field.label}</span>
                  <span>{field.value || '—'}</span>
                </div>
              ))}
          </div>
        ) : null
        return (
          <div key={provider.entryId} style={{ borderTop: '1px solid #8882' }}>
            {row}
            {body}
          </div>
        )
      })}
    </div>
  )
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'web-ui.plugin.item': { kind: 'list'; scope: 'root'; owner: { children?: never } }
  }
}
