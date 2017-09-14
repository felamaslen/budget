require('babel-core/register')();

const { JSDOM } = require('jsdom');

const exposedProperties = ['window', 'navigator', 'document'];

global.window = (new JSDOM('')).window;
global.document = window.document;
Object.keys(window).forEach(property => {
    if (typeof global[property] === 'undefined') {
        exposedProperties.push(property);
        global[property] = window[property];
    }
});

global.navigator = {
    userAgent: 'node.js'
};

global.HTMLElement = global.window.HTMLElement;

documentRef = document; // eslint-disable-line no-undef

