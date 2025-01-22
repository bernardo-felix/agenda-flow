import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    pool: 'threads',
    isolate: false,
    fileParallelism: false,
    poolOptions: {
      forks: { isolate: false },
    },
    coverage: {
      provider: 'v8',
      reporter: ['cobertura'],
    },
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
      '**/prisma/**',
    ],
    root: './',
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      inputSourceMap: false,
    }),
    tsconfigPaths(),
  ],
});
