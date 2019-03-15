import { expect } from 'chai';

import {
    aErrorOpened,
    aErrorClosed,
    aErrorRemoved
} from '~client/actions/error.actions';

import {
    ERROR_OPENED,
    ERROR_CLOSED,
    ERROR_REMOVED
} from '~client/constants/actions';

describe('error.actions', () => {
    describe('aErrorOpened', () =>
        it('should return ERROR_OPENED with message', () => {
            const result = aErrorOpened({ foo: 'bar' });

            expect(result).to.deep.include({
                type: ERROR_OPENED,
                message: { foo: 'bar' }
            });

            expect(result.msgId).to.be.a('number').greaterThan(0);
        })
    );
    describe('aErrorClosed', () =>
        it('should return ERROR_CLOSED with msgId', () =>
            expect(aErrorClosed(10)).to.deep.equal({
                type: ERROR_CLOSED,
                msgId: 10
            })
        )
    );
    describe('aErrorRemoved', () =>
        it('should return ERROR_REMOVED with msgId', () =>
            expect(aErrorRemoved(10)).to.deep.equal({
                type: ERROR_REMOVED,
                msgId: 10
            })
        )
    );
});

