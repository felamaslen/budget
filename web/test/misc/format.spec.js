import { expect } from 'chai';

import {
    sigFigs,
    leadingZeroes
} from '../../src/misc/format';

describe('Format functions', () => {
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
});

