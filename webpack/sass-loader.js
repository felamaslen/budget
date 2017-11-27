const jsonToSassVars = require('./jsonToSassVars');

const sassVariablesObj = require('../web/src/constants/styles');
const sassVariables = encodeURIComponent(jsonToSassVars(
    sassVariablesObj
));

const cssLoaderOptions = JSON.stringify({
    importLoaders: 1
});

module.exports = () => {
    const cssLoader = `css-loader?${cssLoaderOptions}`;
    const postCssLoader = 'postcss-loader';
    const sassLoader = 'sass-loader';
    const prependLoader = `prepend-loader?data=${sassVariables}`;

    if (process.env.NODE_ENV === 'development') {
        return `style-loader!${cssLoader}!${postCssLoader}!${sassLoader}!${prependLoader}`;
    }

    return `${cssLoader}!${postCssLoader}!${sassLoader}!${prependLoader}`;
};

