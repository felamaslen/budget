module.exports = {
    plugins: [
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-proposal-optional-chaining',
        'babel-plugin-webpack-alias-7',
    ],
    presets: ['@babel/preset-typescript', '@babel/preset-react'],
    env: {
        production: {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        modules: false,
                        targets: {
                            browsers: ['last 2 versions', 'ie >= 10'],
                        },
                    },
                ],
            ],
        },
        development: {
            sourceMaps: 'inline',
            presets: [
                [
                    '@babel/preset-env',
                    {
                        modules: false,
                    },
                ],
            ],
            plugins: ['react-hot-loader/babel'],
        },
        node: {
            presets: [
                '@babel/preset-typescript',
                '@babel/preset-react',
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            node: 'current',
                        },
                    },
                ],
            ],
        },
    },
};
