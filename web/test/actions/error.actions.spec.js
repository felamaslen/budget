import { expect } from 'chai';

import * as A from '../../src/actions/error.actions';
import * as C from '../../src/constants/actions';

describe('error.actions', () => {
    describe('aErrorOpened', () =>
        it('should return ERROR_OPENED with message', () =>
            expect(A.aErrorOpened({ foo: 'bar' })).to.deep.equal({
                type: C.ERROR_OPENED, payload: { foo: 'bar' }
            })
        )
    );
    describe('aErrorClosed', () =>
        it('should return ERROR_CLOSED with msgId', () =>
            expect(A.aErrorClosed(10)).to.deep.equal({
                type: C.ERROR_CLOSED, payload: 10
            })
        )
    );
    describe('aErrorRemoved', () =>
        it('should return ERROR_REMOVED with msgId', () =>
            expect(A.aErrorRemoved(10)).to.deep.equal({
                type: C.ERROR_REMOVED, payload: 10
            })
        )
    );
});

