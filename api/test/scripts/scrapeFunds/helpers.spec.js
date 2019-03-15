const { expect } = require('chai');
const helpers = require('~api/scripts/scrapeFunds/helpers');

describe('scrapeFunds helpers', () => {
    describe('removeWhitespace', () => {
        it('should remove whitespace', () => {
            expect(helpers.removeWhitespace(`a\nb\tc\rd e   f   > >>`))
                .to.equal('abcd e f>>>');
        });
    });
});

