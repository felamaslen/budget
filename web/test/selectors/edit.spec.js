import test from 'ava';
import { fromJS } from 'immutable';
import {
    getModalState,
    suggestionsInfo
} from '~client/selectors/edit';

test('getModalState selects the required info from the state', t => {
    t.deepEqual(getModalState(fromJS({
        modalDialog: {
            type: 'foo',
            invalidKeys: 'bar',
            loading: 'baz',
            fieldsString: 'item',
            fieldsValidated: 'fields'
        }
    })), {
        modalDialogType: 'foo',
        invalidKeys: 'bar',
        modalDialogLoading: 'baz',
        item: 'item',
        fields: 'fields'
    });
});

test('suggestionsInfo gets required items from state', t => {
    t.deepEqual(suggestionsInfo(fromJS({
        currentPage: 'page1',
        edit: {
            active: {
                item: 'foo',
                value: 'bar'
            }
        }
    })), {
        page: 'page1',
        item: 'foo',
        value: 'bar'
    });
});
