import '~client-test/browser.js';
import { fromJS } from 'immutable';
import sinon from 'sinon';
import { expect } from 'chai';
import React from 'react';
import 'react-testing-library/cleanup-after-each';
import { render } from 'react-testing-library';
import { Provider } from 'react-redux';
import { createMockStore } from 'redux-test-utils';
import StocksList from '~client/containers/StocksList';
import { aStocksListRequested } from '~client/actions/stocks-list.actions';

describe('<StocksList />', () => {
    const getComponent = () => {
        const store = createMockStore(fromJS({
            other: {
                stocksList: {
                    loadedList: false,
                    loadedInitial: false,
                    stocks: {
                        'CTY.L': {
                            code: 'CTY.L',
                            name: 'City of London Investment Trust',
                            weight: 0.3,
                            gain: 0.01,
                            price: 406.23,
                            up: false,
                            down: true
                        },
                        'SMT.L': {
                            code: 'SMT.L',
                            name: 'Scottish Mortgage Investment Trust',
                            weight: 0.7,
                            gain: -0.54,
                            price: 492.21,
                            up: false,
                            down: true
                        }
                    },
                    indices: {
                        'SPX': {
                            code: 'SPX',
                            name: 'S&P 500',
                            gain: 0.65,
                            up: true,
                            down: false
                        },
                        'FTSE': {
                            code: 'FTSE',
                            name: 'FTSE 100',
                            gain: -0.21,
                            up: false,
                            down: true
                        }
                    },
                    history: [],
                    lastPriceUpdate: 133,
                    weightedGain: -0.02,
                    oldWeightedGain: -0.033
                }
            }
        }));

        const component = (
            <Provider store={store}>
                <StocksList enabled />
            </Provider>
        );

        return { store, component };
    };

    const getContainer = () => {
        const { store, component } = getComponent();

        const utils = render(component);

        return { ...utils, store };
    };

    let clock = null;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
    });

    it('should render a container', () => {
        const { container } = getContainer();

        expect(container.childNodes).to.have.length(1);

        const [div] = container.childNodes;
        expect(div.tagName).to.equal('DIV');
        expect(div.className).to.equal('stocks-list graph-container-outer loading');
        expect(div.childNodes).to.have.length(1);
    });

    it('should request a stocks list when it renders', () => {
        const { store } = getContainer();

        const action = aStocksListRequested();

        expect(store.isActionDispatched(action)).to.equal(false);

        clock.tick(1);

        expect(store.isActionDispatched(action)).to.equal(true);
    });

    it('should render a graph container', () => {
        const { container } = getContainer();

        const [div] = container.childNodes;
        const [graph] = div.childNodes;

        expect(graph.tagName).to.equal('DIV');
        expect(graph.className).to.equal('graph-container');
        expect(graph.childNodes).to.have.length(2);
    });

    it('should render a stocks list', () => {
        const { container } = getContainer();

        const [div] = container.childNodes;
        const [graph] = div.childNodes;
        const [stocksList] = graph.childNodes;

        expect(stocksList.tagName).to.equal('UL');
        expect(stocksList.className).to.equal('stocks-list-ul');
        expect(stocksList.childNodes).to.have.length(2);
    });

    it('should render CTY stock', () => {
        const { container } = getContainer();

        const [div] = container.childNodes;
        const [graph] = div.childNodes;
        const [stocksList] = graph.childNodes;

        const [cty] = stocksList.childNodes;

        expect(cty.tagName).to.equal('LI');
        expect(cty.className).to.equal('up hl-down');
        expect(cty.title).to.equal('City of London Investment Trust');

        expect(cty.childNodes).to.have.length(3);
        cty.childNodes.forEach(tag => {
            expect(tag.tagName).to.equal('SPAN');
        });

        const [nameColumn, price, change] = cty.childNodes;

        expect(nameColumn.className).to.equal('name-column');
        expect(price.className).to.equal('price');
        expect(change.className).to.equal('change');

        expect(nameColumn.childNodes).to.have.length(2);
        nameColumn.childNodes.forEach(tag => {
            expect(tag.tagName).to.equal('SPAN');
        });
        const [code, title] = nameColumn.childNodes;

        expect(code.className).to.equal('code');
        expect(code.innerHTML).to.equal('CTY.L');

        expect(title.className).to.equal('title');
        expect(title.innerHTML).to.equal('City of London Investment Trust');

        expect(price.className).to.equal('price');
        expect(price.innerHTML).to.equal('406.23');

        expect(change.className).to.equal('change');
        expect(change.innerHTML).to.equal('0.01%');
    });

    it('should render SMT stock', () => {
        const { container } = getContainer();

        const [div] = container.childNodes;
        const [graph] = div.childNodes;
        const [stocksList] = graph.childNodes;

        const [, smt] = stocksList.childNodes;

        expect(smt.tagName).to.equal('LI');
        expect(smt.className).to.equal('down hl-down');
        expect(smt.title).to.equal('Scottish Mortgage Investment Trust');

        expect(smt.childNodes).to.have.length(3);
        smt.childNodes.forEach(tag => {
            expect(tag.tagName).to.equal('SPAN');
        });

        const [nameColumn, price, change] = smt.childNodes;

        expect(nameColumn.className).to.equal('name-column');
        expect(price.className).to.equal('price');
        expect(change.className).to.equal('change');

        expect(nameColumn.childNodes).to.have.length(2);
        nameColumn.childNodes.forEach(tag => {
            expect(tag.tagName).to.equal('SPAN');
        });
        const [code, title] = nameColumn.childNodes;

        expect(code.className).to.equal('code');
        expect(code.innerHTML).to.equal('SMT.L');

        expect(title.className).to.equal('title');
        expect(title.innerHTML).to.equal('Scottish Mortgage Investment Trust');

        expect(price.className).to.equal('price');
        expect(price.innerHTML).to.equal('492.21');

        expect(change.className).to.equal('change');
        expect(change.innerHTML).to.equal('-0.54%');
    });

    it('should render a stocks sidebar', () => {
        const { container } = getContainer();

        const [div] = container.childNodes;
        const [graph] = div.childNodes;

        const [, sidebar] = graph.childNodes;

        expect(sidebar.tagName).to.equal('DIV');
        expect(sidebar.className).to.equal('stocks-sidebar');
        expect(sidebar.childNodes).to.have.length(2);
    });

    it('should render a stocks graph', () => {
        const { container } = getContainer();

        const [div] = container.childNodes;
        const [graph] = div.childNodes;

        const [, sidebar] = graph.childNodes;

        const [stocksGraph] = sidebar.childNodes;

        expect(stocksGraph.tagName).to.equal('DIV');
        expect(stocksGraph.className).to.equal('graph-container');
    });

    it('should render a sidebar list', () => {
        const { container } = getContainer();

        const [div] = container.childNodes;
        const [graph] = div.childNodes;

        const [, sidebar] = graph.childNodes;

        const [, sidebarList] = sidebar.childNodes;

        expect(sidebarList.tagName).to.equal('UL');
        expect(sidebarList.childNodes).to.have.length(3);
    });

    it('should render an overall gain', () => {
        const { container } = getContainer();

        const [div] = container.childNodes;
        const [graph] = div.childNodes;
        const [, sidebar] = graph.childNodes;
        const [, sidebarList] = sidebar.childNodes;
        const [gain] = sidebarList.childNodes;

        expect(gain.tagName).to.equal('LI');
        expect(gain.className).to.equal('down hl-up');

        expect(gain.childNodes).to.have.length(2);

        const [name, change] = gain.childNodes;

        expect(name.className).to.equal('name-column');
        expect(name.innerHTML).to.equal('Overall');

        expect(change.className).to.equal('change');
        expect(change.innerHTML).to.equal('-0.02%');
    });
});

