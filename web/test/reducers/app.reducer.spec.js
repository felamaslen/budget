import 'babel-polyfill';
import { Map as map } from 'immutable';
import { expect } from 'chai';

import * as R from '../../src/reducers/app.reducer';

describe('app.reducer', () => {
    describe('getNavRow', () => {
        it('should get the correct row');
    });

    describe('getNavCol', () => {
        it('should get the correct column', () => {
            expect(R.getNavCol({
                dx: 1,
                dy: 0,
                numCols: 5,
                currentRow: 2,
                currentCol: 3
            })).to.equal(4);

            expect(R.getNavCol({
                dx: 1,
                dy: 0,
                numCols: 5,
                currentRow: 2,
                currentCol: 4
            })).to.equal(0);

            expect(R.getNavCol({
                dx: 0,
                dy: -1,
                numCols: 5,
                currentRow: 2,
                currentCol: 4
            })).to.equal(4);

            expect(R.getNavCol({
                dx: -1,
                dy: 0,
                numCols: 5,
                currentRow: 2,
                currentCol: 4
            })).to.equal(3);

            expect(R.getNavCol({
                dx: -1,
                dy: 0,
                numCols: 5,
                currentRow: 2,
                currentCol: 0
            })).to.equal(4);
        });

        it('should jump to beginning and end on start', () => {
            expect(R.getNavCol({
                dx: 1,
                dy: 0,
                numCols: 5,
                currentRow: 0,
                currentCol: -1
            })).to.equal(0);

            expect(R.getNavCol({
                dx: -1,
                dy: 0,
                numCols: 5,
                currentRow: 0,
                currentCol: -1
            })).to.equal(3);
        });
    });

    describe('getNumRowsCols', () => {
        it('should return the row and column of the editing object', () => {
            expect(R.getCurrentRowCol(map({ row: 0, col: 1 }))).to.deep.equal({
                currentRow: 0,
                currentCol: 1
            });
        });
    });
});

