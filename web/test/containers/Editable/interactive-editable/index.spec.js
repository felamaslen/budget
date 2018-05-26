import { List } from 'immutable';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import InteractiveEditable from '../../../../src/containers/Editable/interactive-editable';
import SuggestionsList from '../../../../src/containers/Editable/suggestions-list';

describe('<InteractiveEditable />', () => {
    let changed = null;
    const onChange = value => {
        changed = value;
    };

    const props = {
        item: 'foo',
        value: 'bar',
        suggestionsList: List.of(),
        suggestionsActive: -1,
        onChange
    };

    it('should render its basic structure', () => {
        const wrapper = shallow(<InteractiveEditable {...props} />);

        expect(wrapper.is('span.active.editable.editable-foo')).to.equal(true);
        expect(wrapper.children()).to.have.length(2);
    });

    it('should render an input', () => {
        const wrapper = shallow(<InteractiveEditable {...props} />);

        expect(wrapper.childAt(0).is('input')).to.equal(true);
        expect(wrapper.childAt(0).props()).to.deep.include({
            type: 'text',
            defaultValue: 'bar'
        });
    });

    it('should run onChange when the input changes', () => {
        const wrapper = shallow(<InteractiveEditable {...props} />);

        expect(changed).to.equal(null);

        wrapper.childAt(0).simulate('change', { target: { value: '5' } });

        expect(changed).to.equal('5');
    });

    it('should render a suggestions list', () => {
        const wrapper = shallow(<InteractiveEditable {...props} />);

        expect(wrapper.childAt(1).is(SuggestionsList)).to.equal(true);
    });
});

