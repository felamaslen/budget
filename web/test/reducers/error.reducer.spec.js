/* eslint-disable newline-per-chained-call */
import { expect } from 'chai';
import { fromJS } from 'immutable';
import * as R from '../../src/reducers/error.reducer';

describe('Error reducer', () => {
    describe('rErrorMessageOpen', () => {
        it('should push the message to the list', () => {
            const message = fromJS({
                foo: 'bar'
            });

            const msgId = '119238';

            const result = R.rErrorMessageOpen(fromJS({
                errorMsg: []
            }), { message, msgId });

            expect(result.get('errorMsg').toJS()).to.deep.equal([{ foo: 'bar', id: '119238' }]);
        });
    });

    describe('rErrorMessageClose', () => {
        it('should set the selected message to closed', () => {
            expect(R.rErrorMessageClose(fromJS({
                errorMsg: [
                    { id: 'foo' },
                    { id: 'bar' }
                ]
            }), { msgId: 'foo' }).get('errorMsg').toJS())
                .to.deep.equal([
                    { id: 'foo', closed: true },
                    { id: 'bar' }
                ]);
        });
    });

    describe('rErrorMessageRemove', () => {
        it('should remove the selected message from the list', () => {
            expect(R.rErrorMessageRemove(fromJS({
                errorMsg: [
                    { id: 'foo' },
                    { id: 'bar' }
                ]
            }), { msgId: 'foo' }).get('errorMsg').toJS())
                .to.deep.equal([
                    { id: 'bar' }
                ]);
        });
    });
});

