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

global.nvagiator = {
    userAgent: 'node.js'
};

documentRef = document; // eslint-disable-line no-undef

