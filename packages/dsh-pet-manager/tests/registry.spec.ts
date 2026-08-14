/**
 * Red-first tests for the pet provider registry core (src/registry.ts).
 * Covers: built-in manifest, toggle-mode classification, provider lookup,
 * and the managed-section writer that records entry-level disabled flags in
 * the user profile patch (restart-mode pets).
 */
import { describe, expect, it } from 'vitest'
import {
  BUILTIN_PET_PROVIDERS,
  providerByEntryId,
  classifyToggleMode,
  applyManagedDisabled,
  extractManagedEntries,
  type PetProviderManifest,
} from '../src/registry.ts'

describe('built-in pet providers', () => {
  it('seeds the built-in pet as a runtime-toggled provider', () => {
    const pet = providerByEntryId('pet')
    expect(pet).toBeDefined()
    expect(pet!.settingsNamespace).toBe('pet')
    expect(pet!.toggleMode).toBe('runtime')
    expect(pet!.runtimeToggleFields).toEqual(['enabled', 'visible'])
  })

  it('seeds whale-girl as a restart-toggled provider', () => {
    const whale = providerByEntryId('whale-girl')
    expect(whale).toBeDefined()
    expect(whale!.settingsNamespace).toBe('whale-girl')
    expect(whale!.toggleMode).toBe('restart')
  })

  it('assigns every built-in provider a zh and en display name', () => {
    for (const provider of BUILTIN_PET_PROVIDERS) {
      expect(provider.displayName.zh.length).toBeGreaterThan(0)
      expect(provider.displayName.en.length).toBeGreaterThan(0)
    }
  })
})

describe('classifyToggleMode', () => {
  const base: PetProviderManifest = {
    entryId: 'x',
    displayName: { zh: 'x', en: 'x' },
    settingsNamespace: 'x',
    toggleMode: 'restart',
  }

  it('classifies a provider with a settings namespace as runtime-capable only when marked runtime', () => {
    expect(classifyToggleMode({ ...base, toggleMode: 'runtime' })).toBe('runtime')
    expect(classifyToggleMode({ ...base, toggleMode: 'restart' })).toBe('restart')
  })
})

describe('managed-section writer', () => {
  it('adds a managed section with a disabled entry when the file has none', () => {
    const text = '# existing user patch\n- id: webserver\n  config:\n    host: 0.0.0.0\n'
    const next = applyManagedDisabled(text, 'whale-girl', true)
    expect(next).toContain('dsh-pet-manager')
    expect(next).toContain('- id: whale-girl')
    expect(next).toContain('disabled: true')
    expect(next).toContain('- id: webserver')
  })

  it('updates an existing managed entry instead of duplicating it', () => {
    const once = applyManagedDisabled('', 'whale-girl', true)
    const twice = applyManagedDisabled(once, 'whale-girl', false)
    const entries = extractManagedEntries(twice)
    expect(entries.get('whale-girl')).toBe(false)
    expect((twice.match(/whale-girl/g) ?? []).length).toBe(1)
  })

  it('keeps entries for different providers distinct', () => {
    let text = ''
    text = applyManagedDisabled(text, 'whale-girl', true)
    text = applyManagedDisabled(text, 'dskin', true)
    const entries = extractManagedEntries(text)
    expect(entries.get('whale-girl')).toBe(true)
    expect(entries.get('dskin')).toBe(true)
  })

  it('extracts an empty map from a file with no managed section', () => {
    expect(extractManagedEntries('# nothing\n')).toEqual(new Map())
  })
})
