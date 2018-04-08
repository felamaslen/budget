/* eslint-disable newline-per-chained-call */
import { Map as map } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import ListRowDesktop from '../../../src/containers/ListRowDesktop';
import ListRowCell from '../../../src/components/ListRowCell';
import { EDIT_LIST_ITEM_DELETED } from '../../../src/constants/actions';

describe('<ListRowDesktop />', () => {
    const state = map({
        pages: map({
            food: map({
                rows: map([
                    [10, map({ foo: 'bar', future: true })],
                    [11, map({ bar: 'baz', future: false })]
                ])
            })
        }),
        edit: map({
            active: map({
                row: 10,
                col: 2
            })
        })
    });

    const AfterRow = () => null;

    const store = createMockStore(state);

    const props = {
        page: 'food',
        id: 10,
        AfterRow
    };

    const wrapper = shallow(<ListRowDesktop {...props} />, store).dive();

    it('should render its basic structure', () => {
        expect(wrapper.is('li.future')).to.equal(true);
        expect(wrapper.children()).to.have.length(8);
    });

    it('should render a list of columns', () => {
        expect(wrapper.childAt(0).is(ListRowCell)).to.equal(true);
        expect(wrapper.childAt(0).props()).to.deep.include({
            page: 'food',
            row: map({ foo: 'bar', future: true }),
            colName: 'date',
            colKey: 0,
            id: 10,
            active: false
        });

        expect(wrapper.childAt(1).is(ListRowCell)).to.equal(true);
        expect(wrapper.childAt(1).props()).to.deep.include({
            page: 'food',
            row: map({ foo: 'bar', future: true }),
            colName: 'item',
            colKey: 1,
            id: 10,
            active: false
        });

        expect(wrapper.childAt(2).is(ListRowCell)).to.equal(true);
        expect(wrapper.childAt(2).props()).to.deep.include({
            page: 'food',
            row: map({ foo: 'bar', future: true }),
            colName: 'category',
            colKey: 2,
            id: 10,
            active: true
        });

        expect(wrapper.childAt(3).is(ListRowCell)).to.equal(true);
        expect(wrapper.childAt(3).props()).to.deep.include({
            page: 'food',
            row: map({ foo: 'bar', future: true }),
            colName: 'cost',
            colKey: 3,
            id: 10,
            active: false
        });

        expect(wrapper.childAt(4).is(ListRowCell)).to.equal(true);
        expect(wrapper.childAt(4).props()).to.deep.include({
            page: 'food',
            row: map({ foo: 'bar', future: true }),
            colName: 'shop',
            colKey: 4,
            id: 10,
            active: false
        });
    });

    it('should render a daily column', () => {
        expect(wrapper.childAt(5).is('span.daily'));
        expect(wrapper.childAt(5).children()).to.have.length(0);
    });

    it('should render a <AfterRow /> component', () => {
        expect(wrapper.childAt(6).is(AfterRow)).to.equal(true);
        expect(wrapper.childAt(6).props()).to.deep.include({
            page: 'food',
            row: map({ foo: 'bar', future: true }),
            id: 10
        });
    });

    it('should render a delete button', () => {
        expect(wrapper.childAt(7).is('span.delete')).to.equal(true);
        expect(wrapper.childAt(7).children()).to.have.length(1);
        expect(wrapper.childAt(7).childAt(0).is('a')).to.equal(true);
        expect(wrapper.childAt(7).childAt(0).children()).to.have.length(0);
    });

    it('should dispatch a delete event when the delete button is pressed', () => {
        const action = { type: EDIT_LIST_ITEM_DELETED, page: 'food', id: 10 };

        expect(store.isActionDispatched(action)).to.equal(false);

        wrapper.childAt(7).childAt(0).simulate('click');

        expect(store.isActionDispatched(action)).to.equal(true);
    });
});

