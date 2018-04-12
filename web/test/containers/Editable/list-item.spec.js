import { fromJS } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import ListAddEditItem from '../../../src/containers/Editable/list-item';
import Editable from '../../../src/containers/Editable';

describe('<ListAddEditItem />', () => {
    const props = {
        page: 'food',
        row: 3,
        col: 2
    };

    const wrapper = shallow(<ListAddEditItem {...props} />, createMockStore(fromJS({
        edit: {
            add: {
                food: ['foo', 'bar', 'baz', 'bak']
            },
            row: 2,
            col: 5
        }
    }))).dive();

    it('should render its basic structure', () => {
        expect(wrapper.is('span.category')).to.equal(true);
        expect(wrapper.hasClass('active')).to.equal(false);

        expect(wrapper.children()).to.have.length(1);
    });

    it('should render an <Editable /> item', () => {
        expect(wrapper.childAt(0).is(Editable)).to.equal(true);
        expect(wrapper.childAt(0).props()).to.deep.include({
            row: 3,
            col: 2,
            value: 'baz',
            item: 'category'
        });
    });

    it('should render as active, if active', () => {
        const wrapperActive = shallow(<ListAddEditItem {...props} />, createMockStore(fromJS({
            edit: {
                add: {
                    food: ['foo', 'bar', 'baz', 'bak']
                },
                row: 3,
                col: 2
            }
        }))).dive();

        expect(wrapperActive.hasClass('active')).to.equal(true);
    });
});

