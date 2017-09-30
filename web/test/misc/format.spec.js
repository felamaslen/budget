import { expect } from 'chai';

import {
    capitalise,
    numberFormat,
    sigFigs,
    leadingZeroes,
    formatCurrency,
    formatPercent,
    getTickSize,
    formatAge
} from '../../src/misc/format';

describe('Format functions', () => {
    describe('capitalise', () => {
        it('should capitalise a word', () => {
            expect(capitalise('foobar')).to.equal('Foobar');
            expect(capitalise('fOoBaR')).to.equal('Foobar');
        });
    });
    describe('numberFormat', () => {
        it('should add comma separators', () => {
            expect(numberFormat(1000)).to.equal('1,000');
            expect(numberFormat(91239.192)).to.equal('91,239.192');
            expect(numberFormat(192)).to.equal('192');
        });
    });
    describe('sigFigs', () => {
        it('should return strings of the expected width', () => {
            expect(sigFigs(1, 3)).to.equal('1.00');
            expect(sigFigs(1.55293, 3)).to.equal('1.55');
            expect(sigFigs(34.9239912, 5)).to.equal('34.924');
        });

        it('should handle numbers larger than the width given', () => {
            expect(sigFigs(100000, 3)).to.equal('100000');
        });

        it('should work for 0', () => {
            expect(sigFigs(0, 2)).to.equal('0.0');
            expect(sigFigs(0, 3)).to.equal('0.00');
        });
    });
    describe('leadingZeroes', () => {
        it('should add the expected number of zeroes to a number', () => {
            expect(leadingZeroes(0, 3)).to.equal('000');
            expect(leadingZeroes(1, 3)).to.equal('001');
            expect(leadingZeroes(10, 3)).to.equal('010');
            expect(leadingZeroes(11, 3)).to.equal('011');
            expect(leadingZeroes(100, 3)).to.equal('100');
            expect(leadingZeroes(999, 3)).to.equal('999');
            expect(leadingZeroes(1313, 3)).to.equal('1313');
        });
    });

    describe('formatCurrency', () => {
        it('should format a GBX value into £x.yz format by default, with commas', () => {
            expect(formatCurrency(1)).to.equal('£0.01');
            expect(formatCurrency(-1)).to.equal('\u2212£0.01');
            expect(formatCurrency(145)).to.equal('£1.45');
            expect(formatCurrency(1823123919)).to.equal('£18,231,239.19');
        });

        it('should accept an abbreviate parameter', () => {
            expect(formatCurrency(1000, {
                abbreviate: true
            }))
                .to.equal('£10.00');

            expect(formatCurrency(191233, {
                abbreviate: true
            }))
                .to.equal('£2k');

            expect(formatCurrency(128633219, {
                abbreviate: true
            }))
                .to.equal('£1m');

            expect(formatCurrency(7859128633219, {
                abbreviate: true
            }))
                .to.equal('£79bn');

            expect(formatCurrency(981123199100139, {
                abbreviate: true
            }))
                .to.equal('£10tn');
        });

        it('should accept a precision parameter with abbreviate', () => {
            expect(formatCurrency(818231238, {
                abbreviate: true,
                precision: 1
            }))
                .to.equal('£8.2m');

            expect(formatCurrency(818231238, {
                abbreviate: true,
                precision: 3
            }))
                .to.equal('£8.182m');
        });

        it('should accept a brackets parameter', () => {
            expect(formatCurrency(-8123, {
                brackets: true
            }))
                .to.equal('(£81.23)');

            expect(formatCurrency(192, {
                brackets: true
            }))
                .to.equal('£1.92');
        });

        it('should accept a noSymbol parameter', () => {
            expect(formatCurrency(99123, {
                noSymbol: true
            }))
                .to.equal('991.23');
        });

        it('should accept a noPence parameter', () => {
            expect(formatCurrency(17493, {
                noPence: true
            }))
                .to.equal('£175');
        });

        it('should accept a suffix parameter', () => {
            expect(formatCurrency(7221391, {
                suffix: 'foobar'
            }))
                .to.equal('£72,213.91foobar');
        });

        it('should accept a raw parameter', () => {
            expect(formatCurrency(8824, {
                raw: true
            }))
                .to.equal('\u00a388.24');
        });
    });

    describe('formatPercent', () => {
        it('should add a percent symbol and round', () => {
            expect(formatPercent(19 / 100)).to.equal('19.00%');
            expect(formatPercent(38 / 50)).to.equal('76.00%');
        });
    });

    describe('getTickSize', () => {
        it('should get the correct tick size', () => {
            expect(getTickSize(-1, 11, 10)).to.equal(2);
            expect(getTickSize(0, 996, 5)).to.equal(200);
            expect(getTickSize(0, 1001, 5)).to.equal(500);
        });
    });

    describe('formatAge', () => {
        it('should format the age properly', () => {
            expect(formatAge(86450)).to.equal('1 day, 0 hours ago');
            expect(formatAge(96450)).to.equal('1 day, 3 hours ago');
            expect(formatAge(180450)).to.equal('2 days, 2 hours ago');
            expect(formatAge(812391239)).to.equal('25 years, 9 months ago');
            expect(formatAge(812391239, true)).to.equal('25Y, 9M');
        });
    });
});

