const { JSDOM } = require('jsdom');
const matchMediaMock = require('match-media-mock').create();
matchMediaMock.setConfig({ type: 'screen', width: 1200 });

const exposedProperties = ['window', 'navigator', 'document'];

global.window = (new JSDOM('')).window;
global.document = window.document;

global.window.Date = Date;

global.window.matchMedia = (...args) => matchMediaMock(...args);

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


