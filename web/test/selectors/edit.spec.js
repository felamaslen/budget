import { fromJS } from 'immutable';
import { expect } from 'chai';
import * as S from '~client/selectors/edit';

describe('Edit selectors', () => {
    describe('getModalState', () => {
        it('should select the required info from the state', () => {
            expect(S.getModalState(fromJS({
                modalDialog: {
                    type: 'foo',
                    invalidKeys: 'bar',
                    loading: 'baz',
                    fieldsString: 'item',
                    fieldsValidated: 'fields'
                }
            }))).to.deep.equal({
                modalDialogType: 'foo',
                invalidKeys: 'bar',
                modalDialogLoading: 'baz',
                item: 'item',
                fields: 'fields'
            });
        });
    });

    describe('suggestionsInfo', () => {
        it('should get required items from state', () => {
            expect(S.suggestionsInfo(fromJS({
                currentPage: 'page1',
                edit: {
                    active: {
                        item: 'foo',
                        value: 'bar'
                    }
                }
            })))
                .to.deep.equal({
                    page: 'page1',
                    item: 'foo',
                    value: 'bar'
                });
        });
    });
});

