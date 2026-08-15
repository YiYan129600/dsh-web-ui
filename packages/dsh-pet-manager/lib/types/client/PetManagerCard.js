import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Pet manager card UI. Renders every pet provider with an independent
 * "是否开启" checkbox and an expandable body fed by that provider's own
 * settings namespace (schema + current value from the host). Runtime-mode
 * toggles apply live; restart-mode toggles surface a "需重启生效" banner.
 * @module @linxin666/dsh-pet-manager/client
 */
import { useEffect, useState } from 'react';
export const NS = 'pet-manager';
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
};
const API = '/api/pet-manager';
async function api(path, init) {
    const res = await fetch(API + path, init);
    if (!res.ok)
        throw new Error(String(res.status));
    return (await res.json());
}
function schemaRows(schema, value) {
    const s = schema;
    if (!s)
        return [];
    const record = (value ?? {});
    if (s.type === 'object' && s.dict) {
        return Object.entries(s.dict).map(([key, refId]) => {
            const prop = typeof refId === 'number' ? s.refs?.[refId] : undefined;
            const meta = prop?.meta ?? {};
            return { key, label: key, value: String(record[key] ?? ('default' in meta ? String(meta.default) : '')) };
        });
    }
    if (s.properties) {
        return Object.entries(s.properties).map(([key, prop]) => ({
            key,
            label: prop.title ?? prop.description ?? key,
            value: String(record[key] ?? ''),
        }));
    }
    return [];
}
/** The pet manager card. */
export function PetManagerCard(props) {
    const t = (key) => props.t(key) || copy.zh[key] || key;
    const [providers, setProviders] = useState(null);
    const [openId, setOpenId] = useState(null);
    const [describes, setDescribes] = useState({});
    const [hint, setHint] = useState(null);
    const [error, setError] = useState(null);
    const load = () => {
        api('/list').then((r) => {
            if (r.ok)
                setProviders(r.value);
        }, () => setError(t('error')));
    };
    useEffect(load, []);
    const toggle = (provider) => {
        api('/setEnabled', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ entryId: provider.entryId, enabled: !provider.enabled }),
        }).then((r) => {
            if (r.ok) {
                if (r.restartRequired)
                    setHint(t('restartHint'));
                load();
            }
        }, () => setError(t('error')));
    };
    const expand = (provider) => {
        const next = openId === provider.entryId ? null : provider.entryId;
        setOpenId(next);
        if (next !== null && describes[provider.entryId] === undefined) {
            api('/describe?ns=' + encodeURIComponent(provider.namespace)).then((r) => {
                if (r.ok && r.value)
                    setDescribes((prev) => ({ ...prev, [provider.entryId]: r.value }));
            }, () => setError(t('error')));
        }
    };
    if (error !== null)
        return _jsx("div", { style: { padding: 12, color: '#e06c75' }, children: error });
    const list = providers ?? [];
    return (_jsxs("div", { style: { padding: '8px 4px' }, children: [_jsx("div", { style: { fontWeight: 600, marginBottom: 4 }, children: t('title') }), _jsx("div", { style: { fontSize: 12, opacity: 0.7, marginBottom: 8 }, children: t('description') }), hint !== null
                ? _jsx("div", { style: { padding: '6px 10px', marginBottom: 8, borderRadius: 6, background: '#ffd75e33', border: '1px solid #ffd75e66', fontSize: 12 }, children: hint })
                : null, list.length === 0 ? _jsx("div", { style: { fontSize: 12, opacity: 0.6 }, children: t('noProviders') }) : null, list.map((provider) => {
                const open = openId === provider.entryId;
                const row = (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: provider.enabled, onChange: () => toggle(provider), "aria-label": `${t('enable')}: ${provider.name.zh}` }), _jsx("span", { children: provider.name.zh })] }), provider.restartRequired
                            ? _jsx("span", { style: { fontSize: 11, opacity: 0.6, border: '1px solid #8884', borderRadius: 4, padding: '0 6px' }, children: "restart" })
                            : _jsx("span", { style: { fontSize: 11, opacity: 0.5 }, children: "live" }), _jsx("button", { type: "button", "aria-expanded": open, "aria-label": `${t(open ? 'collapse' : 'expand')}: ${provider.name.zh}`, onClick: () => expand(provider), style: { marginLeft: 'auto', border: 0, background: 'none', cursor: 'pointer', fontSize: 12 }, children: open ? '▴' : '▾' })] }));
                const body = open ? (_jsx("div", { style: { padding: '6px 12px', borderTop: '1px solid #8882', fontSize: 12 }, children: describes[provider.entryId] === undefined
                        ? _jsx("span", { style: { opacity: 0.6 }, children: "\u2026" })
                        : schemaRows(describes[provider.entryId].schema, describes[provider.entryId].value).map((field) => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '3px 0' }, children: [_jsx("span", { style: { opacity: 0.7 }, children: field.label }), _jsx("span", { children: field.value || '—' })] }, field.key))) })) : null;
                return (_jsxs("div", { style: { borderTop: '1px solid #8882' }, children: [row, body] }, provider.entryId));
            })] }));
}
