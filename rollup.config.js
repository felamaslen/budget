import babel from 'rollup-plugin-babel';
import path from 'path';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import sourceMaps from 'rollup-plugin-sourcemaps';
import url from '@rollup/plugin-url';
import svgr from '@svgr/rollup';
import json from '@rollup/plugin-json';

import pkg from './package.json';

const extensions = ['.ts', '.tsx', '.js'];

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  'path',
  'fs',
  'stream',
  'readable-stream',
  'url',
  'util',
  'events',
  'net',
  'tls',
  'buffer',
  'crypto',
  'dns',
  'assert',
  'string_decoder',
  'async_hooks',
];

const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
};

export default {
  input: 'src/server/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      globals,
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    sourceMaps(),
    resolve({
      preferBuiltins: true,
      extensions,
    }),
    url(),
    svgr(),
    json(),
    commonjs({
      include: /node_modules/,
      namedExports: {
        'react-dom': ['render', 'hydrate'],
        slonik: ['createPool'],
        'slonik-interceptor-query-logging': ['createQueryLoggingInterceptor'],
      },
    }),
    alias({
      resolve: ['.ts', '.tsx', '.js'],
      entries: Object.keys(pkg._moduleAliases).reduce(
        (last, key) => ({
          ...last,
          [key]: path.resolve(__dirname, pkg._moduleAliases[key]),
        }),
        {},
      ),
    }),

    babel({
      include: ['src/**/*'],
      extensions,
    }),
  ],

  external: id => external.some(name => id.startsWith(name)),
};
