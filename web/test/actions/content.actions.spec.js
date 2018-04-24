import { expect } from 'chai';

import * as A from '../../src/actions/content.actions';
import * as C from '../../src/constants/actions';

describe('content.actions', () => {
    describe('aContentRequested', () => {
        it('should return CONTENT_REQUESTED with req object', () => expect(A.aContentRequested({
            foo: 'bar'
        })).to.deep.equal({
            type: C.CONTENT_REQUESTED,
            foo: 'bar'
        }));
    });
    describe('aContentLoaded', () => {
        it('should return CONTENT_LOADED with res object', () => expect(A.aContentLoaded({
            foo: 'bar'
        })).to.deep.equal({
            type: C.CONTENT_LOADED,
            foo: 'bar'
        }));
    });
    describe('aContentBlockHovered', () => {
        it('should return CONTENT_BLOCK_HOVERED with req object', () => expect(A.aContentBlockHovered({
            foo: 'bar'
        })).to.deep.equal({
            type: C.CONTENT_BLOCK_HOVERED,
            foo: 'bar'
        }));
    });
    describe('aPageSet', () => {
        it('should return PAGE_SET with page', () => expect(A.aPageSet('general')).to.deep.equal({
            type: C.PAGE_SET,
            page: 'general'
        }));
    });
});

