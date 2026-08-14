import { clientBundle } from '../../shared/tsdown.client.ts'

/**
 * Consumer-side build for git installs (the `prepare` script): transpile
 * straight from src without tsc project references. Types are NOT checked
 * here — `pnpm run typecheck` owns that.
 */
export default clientBundle('@linxin666/dsh-pet-manager', [
  'src/index.ts',
  'src/registry.ts',
], {
  libExternal: ['@deepseek-ai/dsh-settings'],
})
