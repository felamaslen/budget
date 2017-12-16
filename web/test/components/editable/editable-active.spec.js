import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import EditableActive from '../../../src/components/editable/editable-active';
import InteractiveEditable from '../../../src/components/editable/interactive-editable';
import InteractiveEditableTransactions from '../../../src/components/editable/interactive-editable/transactions';

describe('<EditableActive />', () => {
    const props = { foo: 'bar' };

    it('should render <InteractiveEditableTransactions /> for transactions items', () => {
        const wrapper = shallow(<EditableActive item="transactions" {...props} />);

        expect(wrapper.is(InteractiveEditableTransactions)).to.equal(true);
        expect(wrapper.props()).to.deep.equal({ ...props, item: 'transactions' });
    });

    it('should render <InteractiveEditable /> for other items', () => {
        const wrapper = shallow(<EditableActive item="foo" {...props} />);

        expect(wrapper.is(InteractiveEditable)).to.equal(true);
        expect(wrapper.props()).to.deep.equal({ ...props, item: 'foo' });
    });
});

