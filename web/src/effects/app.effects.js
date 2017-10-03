/**
 * Define side effects here (e.g. API calls)
 */

import { Map as map } from 'immutable';
import axios from 'axios';

import {
    PAGES, API_PREFIX, LIST_COLS_PAGES,
    ERROR_LEVEL_WARN
} from '../misc/const';
import { ERROR_MSG_BAD_DATA } from '../misc/config';

import { aServerUpdateReceived, aServerAddReceived } from '../actions/AppActions';
import { aLoginFormSubmitted, aLoginFormResponseReceived } from '../actions/LoginActions';
import { aListItemAdded } from '../actions/EditActions';
import { aMobileDialogClosed } from '../actions/FormActions';

import { getInvalidInsertDataKeys, stringifyFields } from '../reducers/EditReducer';
import { validateFields } from '../reducers/FormReducer';

import { openTimedMessage } from './error.effects';
import { getLoginCredentials, submitLoginForm } from './login.effects';

export async function loadSettings(dispatch) {
    if (!localStorage || !localStorage.getItem) {
        console.warn('localStorage not available - settings not saved');

        return;
    }

    const pin = await getLoginCredentials();

    if (pin) {
        dispatch(aLoginFormSubmitted(pin));

        submitLoginForm(dispatch, null, pin, false);
    }
    else {
        dispatch(aLoginFormResponseReceived(null));
    }
}

export async function updateServerData(dispatch, reduction) {
    const apiKey = reduction.getIn(['user', 'apiKey']);
    const requestList = reduction.getIn(['edit', 'requestList'])
        .map(item => item.get('req'));

    try {
        const response = await axios.patch(`${API_PREFIX}/data/multiple`, {
            list: requestList
        }, {
            headers: { 'Authorization': apiKey }
        });

        dispatch(aServerUpdateReceived(response));
    }
    catch (err) {
        openTimedMessage(dispatch, 'Error updating data on server!');

        dispatch(aServerUpdateReceived(null));
    }
}

async function addServerDataRequest(dispatch, reduction, { item, fields, pageIndex }) {
    if (reduction.get('loadingApi')) {
        openTimedMessage(
            dispatch, 'Wait until the previous request has finished', ERROR_LEVEL_WARN
        );

        return 1;
    }

    const apiKey = reduction.getIn(['user', 'apiKey']);

    try {
        const response = await axios.post(`${API_PREFIX}/data/${PAGES[pageIndex]}`, item, {
            headers: { 'Authorization': apiKey }
        });

        dispatch(aServerAddReceived({ response, fields, pageIndex }));

        return 0;
    }
    catch (err) {
        openTimedMessage(dispatch, 'Error adding data to server!');

        return 1;
    }
}

export function addServerData(dispatch, reduction, { pageIndex, sending }) {
    if (sending) {
        return;
    }

    // validate items
    const active = reduction.getIn(['edit', 'active']);
    let activeItem = null;
    let activeValue = null;
    if (active && active.get('row') === -1) {
        activeItem = active.get('item');
        activeValue = active.get('value');
    }

    const items = reduction
        .getIn(['edit', 'add', pageIndex])
        .map((value, key) => ({
            item: LIST_COLS_PAGES[pageIndex][key],
            value
        }));

    const fields = items.map(({ item, value }) => {
        if (item === activeItem) {
            return map({ item, value: activeValue });
        }

        return map({ item, value });
    });

    const invalidKeys = getInvalidInsertDataKeys(fields);
    const valid = invalidKeys.size === 0;

    if (!valid) {
        openTimedMessage(dispatch, ERROR_MSG_BAD_DATA, ERROR_LEVEL_WARN);

        return;
    }

    // data is validated
    const item = stringifyFields(fields);

    dispatch(aListItemAdded({ pageIndex, sending: true }));

    addServerDataRequest(dispatch, reduction, { pageIndex, item, fields });
}

export async function handleModal(dispatch, reduction, req) {
    if (!req || req.deactivate || reduction.getIn(['modalDialog', 'type']) !== 'add') {
        return;
    }

    const { pageIndex } = req;

    const { fields, invalidKeys } = validateFields(reduction);

    if (invalidKeys.size) {
        return;
    }

    const item = stringifyFields(fields);

    await addServerDataRequest(dispatch, reduction, { pageIndex, item, fields });

    dispatch(aMobileDialogClosed(null));

    setTimeout(() => dispatch(aMobileDialogClosed({ deactivate: true })), 305);
}

