import { defineConfig } from 'tsdown';
import type { UserConfig } from 'tsdown';

const buildConfiguration: UserConfig = defineConfig({
  // Each `src/<domain>/index.ts` becomes a public subpath; keep it in sync with `exports`.
  entry: ['src/index.ts', 'src/*/index.ts'],
  outDir: 'dist',
  format: 'esm',
  platform: 'neutral',
  tsconfig: 'tsconfig.build.json',
  // Per-module output preserves granularity for tree-shaking in consumer bundles.
  unbundle: true,
  dts: true,
  sourcemap: true,
  clean: true,
  copy: [{ from: 'src/styles.css', to: 'dist' }],
});

export default buildConfiguration;
