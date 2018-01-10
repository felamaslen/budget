import { fromJS } from 'immutable';
import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';
import Column from '../../../../../src/containers/page/list/row/column';
import Editable from '../../../../../src/containers/editable';

describe('List page <Column />', () => {
    const props = {
        page: 'page1',
        id: 3,
        row: fromJS({ cols: [null, 'bar'] }),
        colName: 'foo',
        colKey: 1,
        active: true
    };

    const wrapper = shallow(<Column {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.is('span.foo.active')).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.childAt(0).is(Editable)).to.equal(true);
        expect(wrapper.childAt(0).props()).to.deep.include({
            page: 'page1',
            row: 3,
            col: 1,
            item: 'foo',
            value: 'bar'
        });
    });

    it('should not render an active class if inactive', () => {
        const wrapperInactive = shallow(<Column {...props} active={false} />);

        expect(wrapperInactive.hasClass('active')).to.equal(false);
    });
});

