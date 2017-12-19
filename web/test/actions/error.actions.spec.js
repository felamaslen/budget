import { expect } from 'chai';

import * as A from '../../src/actions/error.actions';
import * as C from '../../src/constants/actions';

describe('error.actions', () => {
    describe('aErrorOpened', () =>
        it('should return ERROR_OPENED with message', () => {
            const result = A.aErrorOpened({ foo: 'bar' });

            expect(result).to.deep.include({
                type: C.ERROR_OPENED,
                message: { foo: 'bar' }
            });

            expect(result.msgId).to.be.a('number').greaterThan(0);
        })
    );
    describe('aErrorClosed', () =>
        it('should return ERROR_CLOSED with msgId', () =>
            expect(A.aErrorClosed(10)).to.deep.equal({
                type: C.ERROR_CLOSED,
                msgId: 10
            })
        )
    );
    describe('aErrorRemoved', () =>
        it('should return ERROR_REMOVED with msgId', () =>
            expect(A.aErrorRemoved(10)).to.deep.equal({
                type: C.ERROR_REMOVED,
                msgId: 10
            })
        )
    );
});

