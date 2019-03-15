import { fromJS, List as list } from 'immutable';
import { expect } from 'chai';
import * as R from '~client/reducers/nav';

describe('Nav helpers', () => {
    describe('getNavRowCol', () => {
        const req = {
            rowKeys: list([1, 2, 3, 4, 5]),
            numRows: 5,
            numCols: 3
        };

        describe('for list pages', () => {
            describe('if navigating from the add button', () => {
                const req1 = { ...req, addBtnFocus: true };

                describe('row navigated to', () => {
                    it('should be the last (looping), if going up', () => {
                        expect(R.getNavRowCol({ ...req1, dy: -1 }, true).row).to.equal(5);
                    });

                    it('should be the add row, if going left', () => {
                        expect(R.getNavRowCol({ ...req1, dx: -1, dy: 0 }, true).row).to.equal(-1);
                    });

                    it('should be the first content row, otherwise', () => {
                        expect(R.getNavRowCol({ ...req1, dx: 0, dy: 1 }, true).row).to.equal(1);
                        expect(R.getNavRowCol({ ...req1, dx: 1, dy: 0 }, true).row).to.equal(1);
                    });
                });

                describe('column navigated to', () => {
                    it('should be the first, if going right', () => {
                        expect(R.getNavRowCol({ ...req1, dx: 1, dy: 0 }, true).col).to.equal(0);
                    });

                    it('should be the last, otherwise', () => {
                        expect(R.getNavRowCol({ ...req1, dx: -1, dy: 0 }, true).col).to.equal(2);
                        expect(R.getNavRowCol({ ...req1, dx: 0, dy: 1 }, true).col).to.equal(2);
                        expect(R.getNavRowCol({ ...req1, dx: 0, dy: -1 }, true).col).to.equal(2);
                    });
                });
            });

            describe('otherwise', () => {
                describe('row navigated to', () => {
                    describe('if navigating from an inactive state', () => {
                        const req1 = { ...req, currentRow: -1, currentCol: -1 };

                        it('should be the last, if going backwards', () => {
                            expect(R.getNavRowCol({ ...req1, dx: -1, dy: 0 }, true).row).to.equal(5);
                            expect(R.getNavRowCol({ ...req1, dx: -1, dy: 0 }, true).row).to.equal(5);
                        });

                        it('should be the add row, otherwise', () => {
                            expect(R.getNavRowCol({ ...req1, dx: 1, dy: 0 }, true).row).to.equal(-1);
                            expect(R.getNavRowCol({ ...req1, dx: 0, dy: 1 }, true).row).to.equal(-1);
                        });
                    });

                    it('should be the last (looping), if navigating backwards from the top', () => {
                        const req1 = { ...req, currentCol: 0, currentRow: 0 };

                        expect(R.getNavRowCol({ ...req1, dx: -1, dy: 0 }, true).row).to.equal(5);
                        expect(R.getNavRowCol({ ...req1, dx: 0, dy: -1 }, true).row).to.equal(5);
                    });

                    describe('if currently on the add row', () => {
                        const req1 = { ...req, currentRow: 0 };

                        it('should be the first content row, if at the end and going forward', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 2, dx: 1, dy: 0 }, true).row)
                                .to.equal(1);
                        });
                        it('should be the first content row, if going down', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: 1 }, true).row)
                                .to.equal(1);
                        });
                        it('should be the add row (unchanged), if not at the end, but going forward', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 1, dy: 0 }, true).row)
                                .to.equal(-1);
                        });

                        it('should be the last row (looping), if at the start and going backwards', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 0, dx: -1, dy: 0 }, true).row)
                                .to.equal(5);
                        });
                        it('should be the last row (looping), if going up', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: -1 }, true).row)
                                .to.equal(5);
                        });
                    });

                    describe('if on the first content row', () => {
                        const req1 = { ...req, currentRow: 1 };

                        it('should be the next row, if at the end and going forward', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 2, dx: 1, dy: 0 }, true).row)
                                .to.equal(2);
                        });
                        it('should be the next row, if going down', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: 1 }, true).row)
                                .to.equal(2);
                        });
                        it('should be the same row, if not at the end, but going forward', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 1, dy: 0 }, true).row)
                                .to.equal(1);
                        });

                        it('should be the add row, if at the start and going backwards', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 0, dx: -1, dy: 0 }, true).row)
                                .to.equal(-1);
                        });
                        it('should be the add row, if going up', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: -1 }, true).row)
                                .to.equal(-1);
                        });
                    });

                    describe('if somewhere in the middle', () => {
                        const req1 = { ...req, currentRow: 3 };

                        it('should be the next row, if at the end and going forward', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 2, dx: 1, dy: 0 }, true).row)
                                .to.equal(4);
                        });
                        it('should be the next row, if going down', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: 1 }, true).row)
                                .to.equal(4);
                        });
                        it('should be the same row, if not at the end, but going forward', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 1, dy: 0 }, true).row)
                                .to.equal(3);
                        });

                        it('should be the previous row, if at the start and going backwards', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 0, dx: -1, dy: 0 }, true).row)
                                .to.equal(2);
                        });
                        it('should be the previous row, if going up', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: -1 }, true).row)
                                .to.equal(2);
                        });
                    });

                    describe('if at the end', () => {
                        const req1 = { ...req, currentRow: 5 };

                        it('should be the add row, if at the end and going forward', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 2, dx: 1, dy: 0 }, true).row)
                                .to.equal(-1);
                        });
                        it('should be the add row, if going down', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: 1 }, true).row)
                                .to.equal(-1);
                        });
                        it('should be the same row, if not at the end, but going forward', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 1, dy: 0 }, true).row)
                                .to.equal(5);
                        });

                        it('should be the previous row, if at the start and going backwards', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 0, dx: -1, dy: 0 }, true).row)
                                .to.equal(4);
                        });
                        it('should be the previous row, if going up', () => {
                            expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: -1 }, true).row)
                                .to.equal(4);
                        });
                    });
                });

                describe('column navigated to', () => {
                    it('should be unchanged, if only going up or down', () => {
                        expect(R.getNavRowCol({ ...req, currentCol: 0, dx: 0, dy: -1 }, true).col).to.equal(0);
                        expect(R.getNavRowCol({ ...req, currentCol: 0, dx: 0, dy: 1 }, true).col).to.equal(0);
                        expect(R.getNavRowCol({ ...req, currentCol: 1, dx: 0, dy: -1 }, true).col).to.equal(1);
                        expect(R.getNavRowCol({ ...req, currentCol: 1, dx: 0, dy: 1 }, true).col).to.equal(1);
                    });

                    describe('if at the beginning', () => {
                        const req1 = { ...req, currentCol: 0 };

                        it('should be the last column (looping), if going backwards', () => {
                            expect(R.getNavRowCol({ ...req1, dx: -1 }, true).col).to.equal(2);
                        });
                        it('should be the next column, if going forwards', () => {
                            expect(R.getNavRowCol({ ...req1, dx: 1 }, true).col).to.equal(1);
                        });
                    });
                    describe('if in the middle', () => {
                        const req1 = { ...req, currentCol: 1 };

                        it('should be the previous column, if going backwards', () => {
                            expect(R.getNavRowCol({ ...req1, dx: -1 }, true).col).to.equal(0);
                        });
                        it('should be the next column, if going forwards', () => {
                            expect(R.getNavRowCol({ ...req1, dx: 1 }, true).col).to.equal(2);
                        });
                    });
                    describe('if at the end', () => {
                        const req1 = { ...req, currentCol: 2 };

                        it('should be the previous column, if going backwards', () => {
                            expect(R.getNavRowCol({ ...req1, dx: -1 }, true).col).to.equal(1);
                        });
                        it('should be the first column (looping), if going forwards', () => {
                            expect(R.getNavRowCol({ ...req1, dx: 1 }, true).col).to.equal(0);
                        });
                    });
                });
            });
        });

        describe('for non-list pages', () => {
            describe('row navigated to', () => {
                describe('if navigating from an inactive state', () => {
                    const req1 = { ...req, currentRow: 0, currentCol: -1 };

                    it('should be the last, if going backwards', () => {
                        expect(R.getNavRowCol({ ...req1, dx: -1, dy: 0 }).row).to.equal(4);
                        expect(R.getNavRowCol({ ...req1, dx: -1, dy: 0 }).row).to.equal(4);
                    });

                    it('should be the first row, otherwise', () => {
                        expect(R.getNavRowCol({ ...req1, dx: 1, dy: 0 }).row).to.equal(0);
                        expect(R.getNavRowCol({ ...req1, dx: 0, dy: 1 }).row).to.equal(0);
                    });
                });

                it('should be the last (looping), if navigating backwards from the top', () => {
                    const req1 = { ...req, currentCol: 0, currentRow: 0 };

                    expect(R.getNavRowCol({ ...req1, dx: -1, dy: 0 }).row).to.equal(4);
                    expect(R.getNavRowCol({ ...req1, dx: 0, dy: -1 }).row).to.equal(4);
                });

                describe('if currently on the first row', () => {
                    const req1 = { ...req, currentRow: 0 };

                    it('should be the next row, if at the end and going forward', () => {
                        expect(R.getNavRowCol({ ...req1, currentCol: 2, dx: 1, dy: 0 }).row)
                            .to.equal(1);
                    });
                    it('should be the next row, if going down', () => {
                        expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: 1 }).row)
                            .to.equal(1);
                    });
                    it('should be the same row, if not at the end, but going forward', () => {
                        expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 1, dy: 0 }).row)
                            .to.equal(0);
                    });

                    it('should be the last row (looping), if at the start and going backwards', () => {
                        expect(R.getNavRowCol({ ...req1, currentCol: 0, dx: -1, dy: 0 }).row)
                            .to.equal(4);
                    });
                    it('should be the last row (looping), if going up', () => {
                        expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: -1 }).row)
                            .to.equal(4);
                    });
                });

                describe('if somewhere in the middle', () => {
                    const req1 = { ...req, currentRow: 2 };

                    it('should be the next row, if at the end and going forward', () => {
                        expect(R.getNavRowCol({ ...req1, currentCol: 2, dx: 1, dy: 0 }).row)
                            .to.equal(3);
                    });
                    it('should be the next row, if going down', () => {
                        expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: 1 }).row)
                            .to.equal(3);
                    });
                    it('should be the same row, if not at the end, but going forward', () => {
                        expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 1, dy: 0 }).row)
                            .to.equal(2);
                    });

                    it('should be the previous row, if at the start and going backwards', () => {
                        expect(R.getNavRowCol({ ...req1, currentCol: 0, dx: -1, dy: 0 }).row)
                            .to.equal(1);
                    });
                    it('should be the previous row, if going up', () => {
                        expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: -1 }).row)
                            .to.equal(1);
                    });
                });

                describe('if at the end', () => {
                    const req1 = { ...req, currentRow: 4 };

                    it('should be the first row (looping), if at the end and going forward', () => {
                        expect(R.getNavRowCol({ ...req1, currentCol: 2, dx: 1, dy: 0 }).row)
                            .to.equal(0);
                    });
                    it('should be the first row (looping), if going down', () => {
                        expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: 1 }).row)
                            .to.equal(0);
                    });
                    it('should be the same row, if not at the end, but going forward', () => {
                        expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 1, dy: 0 }).row)
                            .to.equal(4);
                    });

                    it('should be the previous row, if at the start and going backwards', () => {
                        expect(R.getNavRowCol({ ...req1, currentCol: 0, dx: -1, dy: 0 }).row)
                            .to.equal(3);
                    });
                    it('should be the previous row, if going up', () => {
                        expect(R.getNavRowCol({ ...req1, currentCol: 1, dx: 0, dy: -1 }).row)
                            .to.equal(3);
                    });
                });
            });

            describe('column navigated to', () => {
                it('should be unchanged, if only going up or down', () => {
                    expect(R.getNavRowCol({ ...req, currentCol: 0, dx: 0, dy: -1 }).col).to.equal(0);
                    expect(R.getNavRowCol({ ...req, currentCol: 0, dx: 0, dy: 1 }).col).to.equal(0);
                    expect(R.getNavRowCol({ ...req, currentCol: 1, dx: 0, dy: -1 }).col).to.equal(1);
                    expect(R.getNavRowCol({ ...req, currentCol: 1, dx: 0, dy: 1 }).col).to.equal(1);
                });

                describe('if at the beginning', () => {
                    const req1 = { ...req, currentCol: 0 };

                    it('should be the last column (looping), if going backwards', () => {
                        expect(R.getNavRowCol({ ...req1, dx: -1 }).col).to.equal(2);
                    });
                    it('should be the next column, if going forwards', () => {
                        expect(R.getNavRowCol({ ...req1, dx: 1 }).col).to.equal(1);
                    });
                });
                describe('if in the middle', () => {
                    const req1 = { ...req, currentCol: 1 };

                    it('should be the previous column, if going backwards', () => {
                        expect(R.getNavRowCol({ ...req1, dx: -1 }).col).to.equal(0);
                    });
                    it('should be the next column, if going forwards', () => {
                        expect(R.getNavRowCol({ ...req1, dx: 1 }).col).to.equal(2);
                    });
                });
                describe('if at the end', () => {
                    const req1 = { ...req, currentCol: 2 };

                    it('should be the previous column, if going backwards', () => {
                        expect(R.getNavRowCol({ ...req1, dx: -1 }).col).to.equal(1);
                    });
                    it('should be the first column (looping), if going forwards', () => {
                        expect(R.getNavRowCol({ ...req1, dx: 1 }).col).to.equal(0);
                    });
                });
            });
        });
    });

    describe('getNumRowsCols', () => {
        it('should return the number in the data, if the page isn\'t a list page', () => {
            expect(R.getNumRowsCols(fromJS({
                pages: {
                    overview: {
                        rows: [0, 0, 0, 0, 0, 0]
                    }
                }
            }), 'overview', false))
                .to.deep.equal({ numRows: 6, numCols: 1 });
        });

        it('should add one (for the add row) if the page is a list page', () => {
            expect(R.getNumRowsCols(fromJS({
                pages: {
                    food: {
                        rows: [0, 0, 0, 0, 0, 0]
                    }
                }
            }), 'food', true))
                .to.deep.equal({ numRows: 7, numCols: 5 });
        });
    });

    describe('getCurrentRowCol', () => {
        it('should get the current row and column from the editing object', () => {
            expect(R.getCurrentRowCol(fromJS({ row: 10, col: 13 })))
                .to.deep.equal({
                    currentRow: 10,
                    currentCol: 13
                });
        });
    });
});

