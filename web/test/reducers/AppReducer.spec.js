import 'babel-polyfill';
import { Map as map } from 'immutable';
import { expect } from 'chai';

import * as R from '../../src/reducers/AppReducer';

describe('AppReducer', () => {
    describe('getNavRow', () => {
        it('should get the correct row', () => {
            expect(R.getNavRow({
                dx: 1,
                dy: 0,
                numRows: 10,
                numCols: 5,
                currentRow: 2,
                currentCol: 4,
                pageIsList: true
            })).to.equal(2);

            expect(R.getNavRow({
                dx: 1,
                dy: 0,
                numRows: 10,
                numCols: 5,
                currentRow: 2,
                currentCol: 3,
                pageIsList: true
            })).to.equal(1);
        });

        it('should jump to beginning and end on start', () => {
            expect(R.getNavRow({
                dx: 1,
                dy: 0,
                numRows: 10,
                numCols: 5,
                currentRow: 0,
                currentCol: -1
            })).to.equal(0);

            expect(R.getNavRow({
                dx: -1,
                dy: 0,
                numRows: 10,
                numCols: 5,
                currentRow: 0,
                currentCol: -1
            })).to.equal(9);
        });

        it('should not include an extra "add" row for non-list pages', () => {
            expect(R.getNavRow({
                dx: 1,
                dy: 0,
                numRows: 10,
                numCols: 5,
                currentRow: 2,
                currentCol: 3,
                pageIsList: false
            })).to.equal(2);
        });

        it('should navigate from the add button', () => {
            expect(R.getNavRow({
                dx: 1,
                dy: 0,
                numRows: 10,
                numCols: 5,
                currentRow: 0,
                currentCol: 5,
                addBtnFocus: true,
                pageIsList: true
            })).to.equal(0);

            expect(R.getNavRow({
                dx: 0,
                dy: -1,
                numRows: 10,
                numCols: 5,
                currentRow: 0,
                currentCol: 5,
                addBtnFocus: true,
                pageIsList: true
            })).to.equal(8);
        });
    });

    describe('getNavCol', () => {
        it('should get the corret column', () => {
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
            })).to.equal(4);
        });
    });

    describe('getNumRowsCols', () => {
        it('should return the row and column of the editing object', () => {
            expect(R.getCurrentRowCol(map({ row: 0, col: 1 }))).to.deep.equal({
                currentRow: 0,
                currentCol: 1
            });
        });

        it('should add a row for list pages', () => {
            expect(R.getCurrentRowCol(map({ row: 0, col: 1 }), true)).to.deep.equal({
                currentRow: 1,
                currentCol: 1
            });
        });
    });
});

