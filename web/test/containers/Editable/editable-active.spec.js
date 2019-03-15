import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import EditableActive from '~client/containers/Editable/editable-active';
import InteractiveEditable from '~client/containers/Editable/interactive-editable';
import InteractiveEditableTransactions from '~client/containers/Editable/interactive-editable/transactions';

describe('<EditableActive />', () => {
    const props = {
        row: 1,
        col: 1,
        value: { foo: 'bar' },
        onChange: () => null,
        addTransaction: () => null,
        editTransaction: () => null,
        removeTransaction: () => null
    };

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

