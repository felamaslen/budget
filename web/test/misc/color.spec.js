import { expect } from 'chai';

import {
    rgba,
    getOverviewCategoryColor,
    getOverviewScoreColor,
    colorKey
} from '../../src/misc/color';

describe('Color', () => {
    describe('rgba', () => {
        it('should return rgba for four values', () => {
            expect(rgba([254, 19, 99, 0.4])).to.equal('rgba(254,19,99,0.4)');
        });
        it('should return rgb for three values', () => {
            expect(rgba([0, 92, 29])).to.equal('rgb(0,92,29)');
        });
    });
    describe('getOverviewCategoryColor', () => {
        it('should return the correct colour list', () => {
            expect(getOverviewCategoryColor()).to.deep.equal([
                [84, 110, 122],
                [183, 28, 28],
                [67, 160, 71],
                [1, 87, 155],
                [0, 137, 123],
                [191, 158, 36],
                [36, 191, 55],
                [191, 36, 36],
                [
                    [191, 36, 36],
                    [36, 191, 55]
                ],
                [36, 191, 55],
                [36, 191, 55],
                [36, 191, 55]
            ]);
        });
    });
    describe('getOverviewScoreColor', () => {
        it('should return white if the range is zero', () => {
            expect(getOverviewScoreColor(10, { min: 1, max: 1 }))
                .to.deep.equal([255, 255, 255]);
        });
        it('should get the correct color', () => {
            expect(getOverviewScoreColor(
                10,
                { min: -10, max: 20 },
                { negative: 4, positive: 8 },
                [160, 44, 92]
            )).to.deep.equal([200, 132, 160]);

            expect(getOverviewScoreColor(
                -9.4,
                { min: -10, max: 20 },
                { negative: 4, positive: 8 },
                [[160, 44, 92], [9, 119, 203]]
            )).to.deep.equal([165, 55, 100]);
        });
    });
    describe('colorKey', () => {
        it('should return black for the first colour', () => {
            expect(colorKey(0)).to.deep.equal([0, 0, 0]);
        });
        it('should return different colours for other numbers', () => {
            expect(colorKey(1)).to.be.an('array').lengthOf(3);
            expect(colorKey(1)).to.not.deep.equal([0, 0, 0]);

            expect(colorKey(13)).to.be.an('array').lengthOf(3);
            expect(colorKey(13)).to.not.deep.equal([0, 0, 0]);
        });
    });
});

