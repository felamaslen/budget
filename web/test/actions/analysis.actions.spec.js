import { expect } from 'chai';

import {
    aOptionChanged,
    aTreeItemDisplayToggled,
    aTreeItemExpandToggled,
    aTreeItemHovered,
    aBlockClicked,
    aAnalysisDataRefreshed
} from '~client/actions/analysis.actions';

import {
    ANALYSIS_OPTION_CHANGED,
    ANALYSIS_TREE_DISPLAY_TOGGLED,
    ANALYSIS_TREE_EXPAND_TOGGLED,
    ANALYSIS_TREE_HOVERED,
    ANALYSIS_BLOCK_CLICKED,
    ANALYSIS_DATA_REFRESHED
} from '~client/constants/actions';

describe('analysis.actions', () => {
    describe('aOptionChanged', () => {
        it('should return ANALYSIS_OPTION_CHANGED with req object', () =>
            expect(aOptionChanged({ foo: 'bar' })).to.deep.equal({
                type: ANALYSIS_OPTION_CHANGED,
                foo: 'bar'
            })
        );
    });
    describe('aTreeItemDisplayToggled', () => {
        it('should return ANALYSIS_TREE_DISPLAY_TOGGLED with key', () =>
            expect(aTreeItemDisplayToggled(10)).to.deep.equal({
                type: ANALYSIS_TREE_DISPLAY_TOGGLED,
                key: 10
            })
        );
    });
    describe('aTreeItemExpandToggled', () => {
        it('should return ANALYSIS_TREE_EXPAND_TOGGLED with key', () =>
            expect(aTreeItemExpandToggled(10)).to.deep.equal({
                type: ANALYSIS_TREE_EXPAND_TOGGLED,
                key: 10
            })
        );
    });
    describe('aTreeItemHovered', () => {
        it('should return ANALYSIS_TREE_HOVERED with key', () =>
            expect(aTreeItemHovered(10)).to.deep.equal({
                type: ANALYSIS_TREE_HOVERED,
                key: 10
            })
        );
    });
    describe('aBlockClicked', () => {
        it('should return ANALYSIS_BLOCK_CLICKED with req object', () =>
            expect(aBlockClicked({ foo: 'bar' })).to.deep.equal({
                type: ANALYSIS_BLOCK_CLICKED,
                foo: 'bar'
            })
        );
    });
    describe('aAnalysisDataRefreshed', () => {
        it('should return ANALYSIS_DATA_REFRESHED with res object', () =>
            expect(aAnalysisDataRefreshed({ foo: 'bar' })).to.deep.equal({
                type: ANALYSIS_DATA_REFRESHED,
                foo: 'bar'
            })
        );
    });
});

