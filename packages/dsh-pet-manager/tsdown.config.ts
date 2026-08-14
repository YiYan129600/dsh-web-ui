import { clientBundle } from '../../shared/tsdown.client.ts'

export default clientBundle('@linxin666/dsh-pet-manager', [
  'src/index.ts',
  'src/registry.ts',
], {
  libExternal: ['@deepseek-ai/dsh-settings'],
})
