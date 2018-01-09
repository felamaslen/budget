/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import itEach from 'it-each';
itEach({ testPerIteration: true });
import '../../browser';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import Content from '../../../src/containers/content';
import ModalDialog from '../../../src/containers/modal-dialog';
import PageOverview from '../../../src/containers/page/overview';
import PageAnalysis from '../../../src/containers/page/analysis';
import PageList from '../../../src/containers/page/list';

describe('<Content />', () => {
    const pages = [
        { path: '/', component: PageOverview, page: 'overview' },
        { component: PageAnalysis, page: 'analysis' },
        { component: PageList, page: 'funds' },
        { component: PageList, page: 'income' },
        { component: PageList, page: 'bills' },
        { component: PageList, page: 'food' },
        { component: PageList, page: 'general' },
        { component: PageList, page: 'holiday' },
        { component: PageList, page: 'social' }
    ];

    const pageComponents = [PageOverview, PageAnalysis, PageList];

    const state = fromJS({
        user: {
            uid: 1
        },
        modalDialog: {
            active: false,
            visible: false,
            loading: false
        }
    });

    it.each(pages, 'should render %s content page', ['page'], ({ path, component, page }) => {
        const pathname = path || `/${page}`;

        const props = {
            location: {
                pathname
            }
        };

        const store = createMockStore(state.set('currentPage', page));

        const wrapper = mount(
            <Provider store={store}>
                <MemoryRouter initialEntries={[pathname]}>
                    <Content {...props} />
                </MemoryRouter>
            </Provider>
        );

        expect(wrapper.children()).to.have.length(2);
        expect(wrapper.childAt(0).is('div.inner')).to.equal(true);

        expect(wrapper.childAt(0).children()).to.have.length(9);

        expect(wrapper.find(component)).to.have.length(1);
        pageComponents.filter(item => item !== component)
            .forEach(otherPageComponent => expect(wrapper.find(otherPageComponent)).to.have.length(0));

        expect(wrapper.childAt(1).is(ModalDialog)).to.equal(true);
    });

    itEach({ testPerIteration: false });

    it.each(pages, 'should not render anything if not logged in', ({ path, page }) => {
        const pathname = path || `/${page}`;

        const props = {
            location: {
                pathname
            }
        };

        const wrapperLoggedOut = shallow(<Content {...props} />, createMockStore(state.setIn(['user', 'uid'], 0))).dive();

        expect(wrapperLoggedOut.get(0)).to.equal(null);
    });
});

