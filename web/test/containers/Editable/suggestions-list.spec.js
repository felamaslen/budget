import { List as list } from 'immutable';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import SuggestionsList from '../../../src/containers/Editable/suggestions-list';

describe('<SuggestionsList />', () => {
    const props = {
        suggestionsList: list(['foo', 'bar']),
        suggestionsActive: 1
    };

    it('should render a list of suggestions', () => {
        const wrapper = shallow(<SuggestionsList {...props} />);

        expect(wrapper.is('ul.suggestions')).to.equal(true);
        expect(wrapper.children()).to.have.length(2);

        expect(wrapper.childAt(0).is('li.suggestion')).to.equal(true);
        expect(wrapper.childAt(0).text()).to.equal('foo');

        expect(wrapper.childAt(1).is('li.suggestion')).to.equal(true);
        expect(wrapper.childAt(1).text()).to.equal('bar');
    });

    it('should render an active class on the active suggestion, if there is one', () => {
        const wrapper0 = shallow(<SuggestionsList {...props} />);

        expect(wrapper0.childAt(0).hasClass('active')).to.equal(false);
        expect(wrapper0.childAt(1).hasClass('active')).to.equal(true);

        const wrapper1 = shallow(<SuggestionsList {...props} suggestionsActive={-1} />);

        expect(wrapper1.childAt(0).hasClass('active')).to.equal(false);
        expect(wrapper1.childAt(1).hasClass('active')).to.equal(false);
    });
});

