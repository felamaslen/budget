const { JSDOM } = require('jsdom');
const matchMedia = require('match-media-mock').create();

const exposedProperties = ['window', 'navigator', 'document'];

global.window = (new JSDOM('')).window;
global.document = window.document;

global.window.Date = Date;

matchMedia.setConfig({ type: 'screen', width: 1200 });
global.window.matchMedia = matchMedia;

Object.keys(window).forEach(property => {
    if (typeof global[property] === 'undefined') {
        exposedProperties.push(property);
        global[property] = window[property];
    }
});

global.navigator = {
    userAgent: 'node.js'
};

global.localStorage = {
    getItem: () => null,
    setItem: () => null,
    removeItem: () => null
};

global.HTMLElement = global.window.HTMLElement;
