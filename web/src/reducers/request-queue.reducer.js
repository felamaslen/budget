import { Map as map } from 'immutable';
import { PAGES } from '../constants/data';
import { getValueForTransmit } from '../helpers/data';

export function addToRequestQueue(requestList, dataItem, startDate) {
    const page = dataItem.get('page');

    if (dataItem.get('delete')) {
        return requestList.push(map({
            req: map({
                method: 'delete',
                route: page,
                query: map.of(),
                body: map({ id: dataItem.get('id') })
            })
        }));
    }

    const item = dataItem.get('item');
    const value = getValueForTransmit(dataItem.get('value'));

    if (page === 'overview') {
        const key = dataItem.get('row');
        const { year, month } = startDate.plus({ months: key });
        const balance = Math.round(value);

        return requestList.push(map({
            page,
            req: map({
                method: 'post',
                route: 'balance',
                query: map.of(),
                body: map({ year, month, balance })
            })
        }));
    }

    if (PAGES[page].list) {
        const id = dataItem.get('id');

        const reqPageIndex = requestList.findIndex(req =>
            req.get('page') === page && req.getIn(['req', 'body', 'id']) === id
        );

        if (reqPageIndex > -1) {
            return requestList.setIn([reqPageIndex, 'req', 'body', item], value);
        }

        return requestList.push(map({
            page,
            req: map({
                method: 'put',
                route: page,
                query: map.of(),
                body: map({ id, [item]: value })
            })
        }));
    }

    return requestList;
}

export function pushToRequestQueue(state, dataItem) {
    const startDate = state.getIn(['pages', 'overview', 'data', 'startDate']);

    const requestList = state.getIn(['edit', 'requestList']);
    const newRequestList = addToRequestQueue(requestList, dataItem, startDate || null);

    return state
        .setIn(['edit', 'requestList'], newRequestList);
}

