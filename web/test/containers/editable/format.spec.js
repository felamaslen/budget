import { expect } from 'chai';
import { shallow } from 'enzyme';
import * as format from '../../../src/containers/editable/format';
import { YMD } from '../../../src/misc/date';

describe('Editable formatting functions', () => {
    describe('getEditValue', () => {
        describe('for dates', () => {
            it('should try to make a date from the raw value', () => {
                expect(format.getEditValue('date', 'foo', '10/11/2017'))
                    .to.deep.equal(new YMD('10/11/2017'));

                expect(format.getEditValue('date', 'foo', '10/11/17'))
                    .to.deep.equal(new YMD('10/11/17'));
            });

            it('should return the original value if it can\'t', () => {
                expect(format.getEditValue('date', 'foo', 'not a date'))
                    .to.equal('foo');
            });
        });

        describe('for costs', () => {
            it('should return the raw value in pence', () => {
                expect(format.getEditValue('cost', 103, '106.34')).to.equal(10634);
            });

            it('should return 0 for invalid values', () => {
                expect(format.getEditValue('cost', 103, 'not a number')).to.equal(0);
            });
        });

        describe('for transactions', () => {
            it('should return null', () => {
                expect(format.getEditValue('transactions', 'foo', 'bar')).to.equal(null);
            });
        });

        describe('otherwise', () => {
            it('should return the raw value as a string', () => {
                expect(format.getEditValue('text', 'foo', 'bar')).to.equal('bar');
                expect(format.getEditValue('text', 'foo', 100)).to.equal('100');
            });
        });
    });

    describe('formatValue', () => {
        describe('for dates', () => {
            it('should return the formatted date', () => {
                expect(format.formatValue('date', new YMD('10/11/2017'))).to.equal('10/11/2017');
            });

            it('should return an empty string for invalid values', () => {
                expect(format.formatValue('date', null)).to.equal('');
            });
        });

        describe('for costs', () => {
            it('should return the formatted value with currency', () => {
                expect(format.formatValue('cost', 103)).to.equal('£1.03');
            });
        });

        describe('for transactions', () => {
            it('should return a <span /> with the number of transactions', () => {
                const wrapper = shallow(format.formatValue('transactions', { size: 5 }));

                expect(wrapper.is('span.num-transactions')).to.equal(true);
                expect(wrapper.text()).to.equal('5');
            });

            it('should display 0 transactions for bad values', () => {
                const wrapper = shallow(format.formatValue('transactions', null));

                expect(wrapper.is('span.num-transactions')).to.equal(true);
                expect(wrapper.text()).to.equal('0');
            });
        });

        describe('otherwise', () => {
            it('should return the value as a string', () => {
                expect(format.formatValue('text', 'foo')).to.equal('foo');
                expect(format.formatValue('text', 100)).to.equal('100');
            });
        });
    });

    describe('getDefaultValue', () => {
        describe('for dates', () => {
            it('should return the formatted date', () => {
                expect(format.getDefaultValue('date', new YMD('10/11/2017'))).to.equal('10/11/2017');
            });
        });

        describe('for costs', () => {
            it('should return the GBP value if it is non-zero', () => {
                expect(format.getDefaultValue('cost', 103)).to.equal('1.03');
            });

            it('should return an empty string if it is zero', () => {
                expect(format.getDefaultValue('cost', 0)).to.equal('');
            });
        });

        describe('otherwise', () => {
            it('should return the value as a string', () => {
                expect(format.getDefaultValue('text', 'foo')).to.equal('foo');
                expect(format.getDefaultValue('text', 100)).to.equal('100');
            });
        });
    });
});

