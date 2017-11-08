import { expect } from 'chai';

import * as A from '../../src/actions/analysis.actions';
import * as C from '../../src/constants/actions';

describe('analysis.actions', () => {
    describe('aOptionChanged', () => {
        it('should return ANALYSIS_OPTION_CHANGED with req object', () =>
            expect(A.aOptionChanged({ foo: 'bar' })).to.deep.equal({
                type: C.ANALYSIS_OPTION_CHANGED,
                payload: { foo: 'bar' }
            })
        );
    });
    describe('aTreeItemDisplayToggled', () => {
        it('should return ANALYSIS_TREE_DISPLAY_TOGGLED with key', () =>
            expect(A.aTreeItemDisplayToggled(10)).to.deep.equal({
                type: C.ANALYSIS_TREE_DISPLAY_TOGGLED,
                payload: 10
            })
        );
    });
    describe('aTreeItemExpandToggled', () => {
        it('should return ANALYSIS_TREE_EXPAND_TOGGLED with key', () =>
            expect(A.aTreeItemExpandToggled(10)).to.deep.equal({
                type: C.ANALYSIS_TREE_EXPAND_TOGGLED,
                payload: 10
            })
        );
    });
    describe('aTreeItemHovered', () => {
        it('should return ANALYSIS_TREE_HOVERED with key', () =>
            expect(A.aTreeItemHovered(10)).to.deep.equal({
                type: C.ANALYSIS_TREE_HOVERED,
                payload: 10
            })
        );
    });
    describe('aBlockClicked', () => {
        it('should return ANALYSIS_BLOCK_CLICKED with req object', () =>
            expect(A.aBlockClicked({ foo: 'bar' })).to.deep.equal({
                type: C.ANALYSIS_BLOCK_CLICKED,
                payload: { foo: 'bar' }
            })
        );
    });
    describe('aAnalysisDataRefreshed', () => {
        it('should return ANALYSIS_DATA_REFRESHED with res object', () =>
            expect(A.aAnalysisDataRefreshed({ foo: 'bar' })).to.deep.equal({
                type: C.ANALYSIS_DATA_REFRESHED,
                payload: { foo: 'bar' }
            })
        );
    });
});

