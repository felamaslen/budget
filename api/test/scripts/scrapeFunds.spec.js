/**
 * Spec for fund price scraper
 */

require('dotenv').config();
const expect = require('chai').expect;

const scraper = require('../../scripts/scrapeFunds');

describe('Fund scraper', () => {
    describe('matchPartsRegex', () => {
        it('should build a regex out of parts, and match data against it', () => {
            const parts = [
                '<table>',
                /(.*)/,
                '</table>'
            ];

            const data = 'fljksdflkjsdf<table>abcdefgh</table>jfjl  lalala';

            expect(scraper.matchPartsRegex(parts, data)).to.equal(
                '<table>abcdefgh</table>'
            );
        });
    });
});

