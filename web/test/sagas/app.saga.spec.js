import 'babel-polyfill'
import '../browser'
import { expect } from 'chai'
import { call, put } from 'redux-saga/effects'

import * as S from '../../src/sagas/app.saga'
import { getLoginCredentials } from '../../src/sagas/login.saga'
import { aLoginFormSubmitted, aLoginFormResponseReceived } from '../../src/actions/login.actions'

describe('app.saga', () => {
    describe('loadSettings', () => {
        it('should yield a call to retrieve the PIN from localStorage', () => {
            const iter = S.loadSettings()
            const next = iter.next()

            expect(next.value).to.deep.equal(call(getLoginCredentials))
        })
        describe('if a pin is stored', () => {
            it('should load the pin and put aLoginFormSubmitted', () => {
                const iter = S.loadSettings()
                let next = iter.next()
                next = iter.next(1000)

                expect(next.value).to.deep.equal(put(aLoginFormSubmitted(1000)))
            })
        })
        describe('otherwise', () => {
            it('should reset the login form', () => {
                const iter = S.loadSettings()
                let next = iter.next()
                next = iter.next()

                expect(next.value).to.deep.equal(put(aLoginFormResponseReceived(null)))
            })
        })
    })
})

