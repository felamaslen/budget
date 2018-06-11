import { expect } from 'chai';
import { List as list } from 'immutable';
import * as color from '../../src/helpers/color';

describe('Color', () => {
    describe('rgba', () => {
        it('should return rgba for four values', () => {
            expect(color.rgba([254, 19, 99, 0.4])).to.equal('rgba(254,19,99,0.4)');
        });
        it('should return rgb for three values', () => {
            expect(color.rgba([0, 92, 29])).to.equal('rgb(0,92,29)');
        });
    });
    describe('getOverviewCategoryColor', () => {
        it('should return the correct colour list', () => {
            expect(color.getOverviewCategoryColor().toJS()).to.deep.equal({
                funds: [84, 110, 122],
                bills: [183, 28, 28],
                food: [67, 160, 71],
                general: [1, 87, 155],
                holiday: [0, 137, 123],
                social: [191, 158, 36],
                income: [36, 191, 55],
                spending: [191, 36, 36],
                net: [
                    [191, 36, 36],
                    [36, 191, 55]
                ],
                predicted: [36, 191, 55],
                balance: [36, 191, 55]
            });
        });
    });
    describe('getOverviewScoreColor', () => {
        it('should return white if the range is zero', () => {
            expect(color.getOverviewScoreColor(10, { min: 1, max: 1 }))
                .to.deep.equal([255, 255, 255]);
        });
        it('should get the correct color', () => {
            expect(color.getOverviewScoreColor(
                10,
                { min: -10, max: 20 },
                { negative: 4, positive: 8 },
                [160, 44, 92]
            )).to.deep.equal([200, 132, 160]);

            expect(color.getOverviewScoreColor(
                -9.4,
                { min: -10, max: 20 },
                { negative: 4, positive: 8 },
                [[160, 44, 92], [9, 119, 203]]
            )).to.deep.equal([165, 55, 100]);
        });
    });
    describe('colorKey', () => {
        it('should return different colours for other numbers', () => {
            expect(color.colorKey('foo')).to.be.an('array').lengthOf(3);
            expect(color.colorKey('foo')).to.not.deep.equal([0, 0, 0]);

            expect(color.colorKey('bar')).to.be.an('array').lengthOf(3);
            expect(color.colorKey('bar')).to.not.deep.equal([0, 0, 0]);
            expect(color.colorKey('bar')).to.not.deep.equal(color.colorKey('foo'));
        });
    });

    describe('averageColor', () => {
        it('should return an average colour', () => {
            expect(color.averageColor(list([
                [123, 245, 3],
                [255, 2, 30],
                [39, 128, 255]
            ]))).to.deep.equal([139, 125, 96]);
        });

        it('should return transparent by default', () => {
            expect(color.averageColor(list.of())).to.deep.equal([255, 255, 255, 0]);
        });
    });
});

