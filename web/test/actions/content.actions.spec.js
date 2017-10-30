import { expect } from 'chai';

import * as A from '../../src/actions/content.actions';
import * as C from '../../src/constants/actions';

describe('content.actions', () => {
    describe('aContentRequested', () => {
        it('should return CONTENT_REQUESTED with req object', () => expect(A.aContentRequested({
            foo: 'bar'
        })).to.deep.equal({
            type: C.CONTENT_REQUESTED,
            payload: { foo: 'bar' }
        }));
    });
    describe('aContentLoaded', () => {
        it('should return CONTENT_LOADED', () => expect(A.aContentLoaded()).to.deep.equal({
            type: C.CONTENT_LOADED,
            payload: null
        }));
    });
    describe('aContentBlockHovered', () => {
        it('should return CONTENT_BLOCK_HOVERED with req object', () => expect(A.aContentBlockHovered({
            foo: 'bar'
        })).to.deep.equal({
            type: C.CONTENT_BLOCK_HOVERED,
            payload: { foo: 'bar' }
        }))
    });
});

