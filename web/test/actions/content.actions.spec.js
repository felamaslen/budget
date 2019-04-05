import test from 'ava';

import {
    aContentRequested,
    aContentLoaded,
    aContentBlockHovered,
    aPageSet
} from '~client/actions/content.actions';

import {
    CONTENT_REQUESTED,
    CONTENT_LOADED,
    CONTENT_BLOCK_HOVERED,
    PAGE_SET
} from '~client/constants/actions';

test('aContentRequested returns CONTENT_REQUESTED with req object', t => {
    t.deepEqual(aContentRequested({
        foo: 'bar'
    }), {
        type: CONTENT_REQUESTED,
        foo: 'bar'
    });
});

test('aContentLoaded returns CONTENT_LOADED with res object', t => {
    t.deepEqual(aContentLoaded({
        foo: 'bar'
    }), {
        type: CONTENT_LOADED,
        foo: 'bar'
    });
});

test('aContentBlockHovered returns CONTENT_BLOCK_HOVERED with req object', t => {
    t.deepEqual(aContentBlockHovered({
        foo: 'bar'
    }), {
        type: CONTENT_BLOCK_HOVERED,
        foo: 'bar'
    });
});

test('aPageSet returns PAGE_SET with page', t => {
    t.deepEqual(aPageSet('general'), {
        type: PAGE_SET,
        page: 'general'
    });
});

