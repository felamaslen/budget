import { fromJS } from 'immutable';
import '../../browser';
import 'react-testing-library/cleanup-after-each';
import { render } from 'react-testing-library';
import { Provider } from 'react-redux';
import { expect } from 'chai';
import { createMockStore } from 'redux-test-utils';
import React from 'react';
import Page from '../../../src/containers/Page';
import { aContentRequested } from '../../../src/actions/content.actions';

describe('<Page />', () => {
    const getContainer = (props = {}) => {
        const state = fromJS({
            pages: {
                food: {},
                general: {}
            }
        });

        const store = createMockStore(state);

        const utils = render(
            <Provider store={store}>
                <Page page="general" {...props}>
                    <span>{'text'}</span>
                </Page>
            </Provider>
        );

        return { ...utils, store };
    };

    it('should render a basic page container', () => {
        const { container } = getContainer();

        const [div] = container.childNodes;

        expect(div.tagName).to.equal('DIV');
        expect(div.className).to.equal('page page-general');

        expect(div.childNodes).to.have.length(1);

        const [span] = div.childNodes;
        expect(span.tagName).to.equal('SPAN');
        expect(span.innerHTML).to.equal('text');
    });

    it('should render nothing if the page content is not loaded yet', () => {
        const { container } = getContainer({ page: 'holiday' });

        expect(container.innerHTML).to.equal('');
    });

    it('should dispatch an action when rendering', () => {
        const { store } = getContainer({ page: 'bills' });

        const action = aContentRequested({ page: 'bills' });

        expect(store.isActionDispatched(action)).to.equal(true);
    });
});

