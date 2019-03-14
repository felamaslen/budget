import '../../browser';
import { Map as map, List as list } from 'immutable';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import ModalDialogField from '../../../src/components/FormField/modal-dialog-field';
import FormField from '../../../src/containers/FormField';
import { TransactionsList } from '../../../src/helpers/data';

describe('<ModalDialogField />', () => {
    const props = {
        fieldKey: 3,
        field: map({
            item: 'foo',
            value: 'bar'
        }),
        invalidKeys: list.of()
    };

    it('should render its basic structure', () => {
        const wrapper = shallow(<ModalDialogField {...props} />);

        expect(wrapper.is('li.form-row.foo')).to.equal(true);
        expect(wrapper.hasClass('invalid')).to.equal(false);
        expect(wrapper.children()).to.have.length(2);
    });

    it('should render a label', () => {
        const wrapper = shallow(<ModalDialogField {...props} />);

        expect(wrapper.childAt(0).is('span.form-label')).to.equal(true);
        expect(wrapper.childAt(0).text()).to.equal('foo');
    });

    it('should render a form field container', () => {
        const wrapper = shallow(<ModalDialogField {...props} />);

        const formField = wrapper.childAt(1);

        expect(formField.is(FormField)).to.equal(true);
        expect(formField.props()).to.deep.equal({
            fieldKey: 3,
            item: 'foo',
            value: 'bar'
        });
    });

    it('should render an invalid class', () => {
        const wrapper = shallow(<ModalDialogField {...props} invalidKeys={list([3])} />);

        expect(wrapper.hasClass('invalid')).to.equal(true);
    });

    describe('for transactions fields', () => {
        it('should render an inner div', () => {
            const trProps = {
                ...props,
                field: map({
                    item: 'transactions',
                    value: new TransactionsList([])
                })
            };

            const wrapper = shallow(<ModalDialogField {...trProps} />);

            expect(wrapper.children()).to.have.length(1);
            expect(wrapper.childAt(0).is('div.inner')).to.equal(true);

            expect(wrapper.childAt(0).children()).to.have.length(2);
        });
    });
});
