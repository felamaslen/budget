import 'babel-polyfill'
import '../browser'
import { Map as map } from 'immutable'
import { expect } from 'chai'
import { put } from 'redux-saga/effects'
import * as S from '../../src/sagas/error.saga'
import { aErrorOpened } from '../../src/actions/error.actions'
import { ERROR_LEVEL_ERROR } from '../../src/misc/const'

describe('error.saga', () => {
    describe('openTimedMessage', () => {
        it('should notify the store of a new message', () => {
            const iter = S.openTimedMessage('foo')

            expect(iter.next().value).to.deep.equal(put(aErrorOpened(map({
                text: 'foo',
                level: ERROR_LEVEL_ERROR
            }))))
        })
        it('should accept a level argument', () => {
            const iter = S.openTimedMessage('bar', 100)

            expect(iter.next().value).to.deep.equal(put(aErrorOpened(map({
                text: 'bar',
                level: 100
            }))))
        })
    })
})

