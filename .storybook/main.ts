import path from 'path';
import { Configuration } from 'webpack';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';

const toPath = (_path: string) => path.join(process.cwd(), _path);

export default {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  webpackFinal: async (config: Configuration): Promise<Configuration> => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@emotion/core': toPath('node_modules/@emotion/react'),
        '@emotion/styled': toPath('node_modules/@emotion/styled'),
        'emotion-theming': toPath('node_modules/@emotion/react'),
      },
      plugins: [
        ...(config.resolve?.plugins || []),
        new TsconfigPathsPlugin() as unknown as Required<
          Required<Configuration>['resolve']
        >['plugins'][0],
      ],
    },
  }),
};
