/* eslint-disable newline-per-chained-call */
import chai, { expect } from 'chai';
import itEach from 'it-each';
itEach();
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
import React from 'react';
import { shallow } from 'enzyme';
import AddForm from '../../../src/components/ListBodyDesktop/AddForm';
import ListAddEditItem from '../../../src/containers/Editable/list-item';

describe('List page <AddForm />', () => {
    const props = {
        page: 'food',
        addBtnFocus: false,
        onAdd: sinon.spy()
    };

    const wrapper = shallow(<AddForm {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.is('li.li-add')).to.equal(true);
        expect(wrapper.children()).to.have.length(6);
    });

    it.each([0, 1, 2, 3, 4], 'should render add item form elements', col => {
        expect(wrapper.childAt(col).is(ListAddEditItem)).to.equal(true);
        expect(wrapper.childAt(col).props()).to.deep.include({
            page: 'food',
            row: -1,
            col,
            id: null
        });
    });

    it('should render an add button', () => {
        expect(wrapper.childAt(5).is('span.add-button-outer')).to.equal(true);
        expect(wrapper.childAt(5).children()).to.have.length(1);
        expect(wrapper.childAt(5).childAt(0).is('button')).to.equal(true);
        expect(wrapper.childAt(5).childAt(0).text()).to.equal('Add');
    });

    it('should dispatch an action when the add button is pressed', () => {
        wrapper.childAt(5).childAt(0).simulate('click');

        expect(props.onAdd).to.have.been.calledWith();
    });
});

