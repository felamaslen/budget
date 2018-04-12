import { fromJS } from 'immutable';
import { expect } from 'chai';
import itEach from 'it-each';
itEach();
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import React from 'react';
import Editable from '../../../src/containers/Editable';
import EditableActive from '../../../src/containers/Editable/editable-active';
import EditableInactive from '../../../src/containers/Editable/editable-inactive';

describe('<Editable />', () => {
    it('should render an active editable item, if active', () => {
        const state = fromJS({
            edit: {
                active: {
                    row: 3,
                    col: 4
                }
            },
            editSuggestions: {
                list: ['baz'],
                active: false
            }
        });

        const props = {
            row: 3,
            col: 4,
            item: 'foo',
            value: 'bar'
        };

        const wrapper = shallow(<Editable {...props} />, createMockStore(state)).dive();

        expect(wrapper.is(EditableActive)).to.equal(true);
        expect(wrapper.props()).to.deep.include({
            ...props,
            suggestionsList: fromJS(['baz']),
            suggestionsActive: false
        });
    });

    it.each([2, 3, 4], 'should render an inactive editable item, if not active', key => {
        const state = fromJS({
            edit: {
                active: {
                    row: 3,
                    col: 4
                }
            },
            editSuggestions: {
                list: ['baz'],
                active: false
            }
        });

        const props = {
            row: key,
            col: key,
            item: 'foo',
            value: 'bar'
        };

        const wrapper = shallow(<Editable {...props} />, createMockStore(state)).dive();

        expect(wrapper.is(EditableInactive)).to.equal(true);
        expect(wrapper.props()).to.deep.include({
            ...props,
            suggestionsList: fromJS(['baz']),
            suggestionsActive: false
        });
    });
});

