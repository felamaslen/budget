const jsonToSassVars = require('./jsonToSassVars');

const sassVariablesObj = require('../web/src/constants/styles');
const sassVariables = encodeURIComponent(jsonToSassVars(
    sassVariablesObj
));

const sassLoader = `css-loader!sass-loader!prepend-loader?data=${sassVariables}`;

module.exports = {
    loaders: [
        {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        },
        {
            test: /favicon\.png/,
            loader: 'file-loader',
            query: {
                name: 'favicon.ico',
                publicPath: './'
            }
        },
        {
            test: filename => {
                if (filename.match(/favicon\.png/)) {
                    return false;
                }

                return filename.match(/\.(woff2?|ttf|eot|svg|png|jpg)(\?v=[0-9]\.[0-9]\.[0-9])?$/);
            },
            loader: 'file-loader',
            query: {
                name: 'assets/[hash].[ext]',
                publicPath: '../'
            }
        },
        {
            test: /\.scss$/,
            exclude: /node_modules/,
            loader: sassLoader
        }
    ]
};

