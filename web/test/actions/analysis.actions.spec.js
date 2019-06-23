import test from 'ava';

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

test('aOptionChanged returns ANALYSIS_OPTION_CHANGED with req object', t => {
    t.deepEqual(aOptionChanged({ foo: 'bar' }), {
        type: ANALYSIS_OPTION_CHANGED,
        foo: 'bar'
    });
});

test('aTreeItemDisplayToggled returns ANALYSIS_TREE_DISPLAY_TOGGLED with key', t => {
    t.deepEqual(aTreeItemDisplayToggled(10), {
        type: ANALYSIS_TREE_DISPLAY_TOGGLED,
        key: 10
    });
});

test('aTreeItemExpandToggled returns ANALYSIS_TREE_EXPAND_TOGGLED with key', t => {
    t.deepEqual(aTreeItemExpandToggled(10), {
        type: ANALYSIS_TREE_EXPAND_TOGGLED,
        key: 10
    });
});

test('aTreeItemHovered returns ANALYSIS_TREE_HOVERED with key', t => {
    t.deepEqual(aTreeItemHovered(10), {
        type: ANALYSIS_TREE_HOVERED,
        key: 10
    });
});

test('aBlockClicked returns ANALYSIS_BLOCK_CLICKED with req object', t => {
    t.deepEqual(aBlockClicked({ foo: 'bar' }), {
        type: ANALYSIS_BLOCK_CLICKED,
        foo: 'bar'
    });
});

test('aAnalysisDataRefreshed returns ANALYSIS_DATA_REFRESHED with res object', t => {
    t.deepEqual(aAnalysisDataRefreshed({ foo: 'bar' }), {
        type: ANALYSIS_DATA_REFRESHED,
        foo: 'bar'
    });
});
