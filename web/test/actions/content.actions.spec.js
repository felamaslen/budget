import { expect } from 'chai';

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

describe('content.actions', () => {
    describe('aContentRequested', () => {
        it('should return CONTENT_REQUESTED with req object', () => expect(aContentRequested({
            foo: 'bar'
        })).to.deep.equal({
            type: CONTENT_REQUESTED,
            foo: 'bar'
        }));
    });
    describe('aContentLoaded', () => {
        it('should return CONTENT_LOADED with res object', () => expect(aContentLoaded({
            foo: 'bar'
        })).to.deep.equal({
            type: CONTENT_LOADED,
            foo: 'bar'
        }));
    });
    describe('aContentBlockHovered', () => {
        it('should return CONTENT_BLOCK_HOVERED with req object', () => expect(aContentBlockHovered({
            foo: 'bar'
        })).to.deep.equal({
            type: CONTENT_BLOCK_HOVERED,
            foo: 'bar'
        }));
    });
    describe('aPageSet', () => {
        it('should return PAGE_SET with page', () => expect(aPageSet('general')).to.deep.equal({
            type: PAGE_SET,
            page: 'general'
        }));
    });
});

