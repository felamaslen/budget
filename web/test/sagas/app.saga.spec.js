/* eslint-disable no-unused-expressions */
import 'babel-polyfill'
import '../browser'
import { fromJS } from 'immutable'
import { expect } from 'chai'
import { select, call, put } from 'redux-saga/effects'
import axios from 'axios'

import * as S from '../../src/sagas/app.saga'
import { selectApiKey } from '../../src/sagas'
import { getLoginCredentials } from '../../src/sagas/login.saga'
import { openTimedMessage } from '../../src/sagas/error.saga'

import { aServerUpdateReceived, aServerAddReceived } from '../../src/actions/app.actions'
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

    describe('selectRequestList', () => {
        it('should get the requestList and map it to each request', () => {
            expect(S.selectRequestList(fromJS({
                edit: {
                    requestList: [{ req: 1, foo: 'bar' }, { req: 2, bar: 'baz' }]
                }
            })).toJS()).to.deep.equal([1, 2])
        })
    })

    describe('updateServerData', () => {
        const iter = S.updateServerData()
        let next = iter.next()

        it('should select the api key', () => {
            expect(next.value).to.deep.equal(select(selectApiKey))
            next = iter.next('some_api_key')
        })
        it('should select the request list', () => {
            expect(next.value).to.deep.equal(select(S.selectRequestList))
            next = iter.next([{ req1: 'foo' }])
        })
        it('should call the API with a patch request', () => {
            expect(next.value).to.deep.equal(call(axios.patch, 'api/v3/data/multiple', {
                list: [{ req1: 'foo' }]
            }, {
                headers: { 'Authorization': 'some_api_key' }
            }))
        })

        describe('if the response is successful', () => {
            it('should notify the store', () => {
                next = iter.next({ data: 'something' })
                expect(next.value).to.deep.equal(put(aServerUpdateReceived({ data: 'something' })))
            })
        })

        describe('if an error occurs', () => {
            it('should open an error message and notify the store', () => {
                const iter2 = S.updateServerData()
                iter2.next() // select api key
                iter2.next() // select request list
                iter2.next() // call api

                expect(iter2.throw('some error occurred').value).to.deep.equal(
                    call(openTimedMessage, 'Error updating data on server!'))

                expect(iter2.next().value).to.deep.equal(put(aServerUpdateReceived(null)))
            })
        })
    })

    describe('addServerDataRequest', () => {
        const iter = S.addServerDataRequest({ item: 'foo', fields: [{ field1: 'blah' }], pageIndex: 3 })
        let next = iter.next()

        it('should select the api key', () => {
            expect(next.value).to.deep.equal(select(selectApiKey))
            next = iter.next('some_api_key')
        })
        it('should call makePostRequest with the parameters', () => {
            expect(next.value).to.deep.equal(call(axios.post, 'api/v3/data/income', 'foo', {
                headers: { 'Authorization': 'some_api_key' }
            }))
        })

        describe('if the response is successful', () => {
            it('should notify the store', () => {
                next = iter.next({ data: 'something' })
                expect(next.value).to.deep.equal(put(aServerAddReceived({
                    response: { data: 'something' },
                    fields: [{ field1: 'blah' }],
                    pageIndex: 3
                })))

                next = iter.next()
            })
            it('should return 0', () => expect(next.value).to.equal(0))
        })

        describe('if an error occurs', () => {
            const iter2 = S.addServerDataRequest({ item: 'foo', fields: [], pageIndex: 0 })
            it('should open an error message and notify the store', () => {
                iter2.next() // select api key
                iter2.next() // call api

                expect(iter2.throw('fsome error occurred').value).to.deep.equal(
                    call(openTimedMessage, 'Error adding data to server!'))
            })
            it('should return 1', () => expect(iter2.next().value).to.equal(1))
        })
    })

    describe('selectAddData', () => {
        it('should get the fields and item', () => {
            expect(S.selectAddData(fromJS({
                edit: {
                    addFields: 'foo',
                    addFieldsString: 'bar'
                }
            }))).to.deep.equal({ fields: 'foo', item: 'bar' })
        })
    })

    describe('addServerData', () => {
        const iter = S.addServerData({ payload: { pageIndex: 3 } })
        let next = iter.next()

        it('should select the data in the form fields', () => {
            expect(next.value).to.deep.equal(select(S.selectAddData))
        })
        describe('if the data was valid', () => {
            it('should call addServerDataRequest', () => {
                next = iter.next({ fields: 'foo', item: 'bar' })

                expect(next.value).to.deep.equal(call(S.addServerDataRequest, {
                    pageIndex: 3, item: 'bar', fields: 'foo'
                }))
            })
        })
        describe('otherwise', () => {
            it('should do nothing', () => {
                const iter2 = S.addServerData({ payload: { pageIndex: 3 } })
                iter2.next() // select data

                expect(iter2.next({ fields: 'foo' }).value).to.be.undefined
                expect(iter2.next({ item: 'bar' }).value).to.be.undefined
                expect(iter2.next().value).to.be.undefined
                expect(iter2.next({ fields: 'foo', item: 'bar' })).to.not.be.undefined
            })
        })
    })
})

