import { Map as map } from 'immutable';

import { PAGES, LIST_PAGES } from '../misc/const';
import { getValueForTransmit } from '../misc/data';

export function addToRequestQueue(requestList, dataItem, startYearMonth = null) {
    const pageIndex = dataItem.get('pageIndex');

    if (dataItem.get('delete')) {
        return requestList.push(map({
            req: map({
                method: 'delete',
                route: PAGES[dataItem.get('pageIndex')],
                query: map.of(),
                body: map({ id: dataItem.get('id') })
            })
        }));
    }

    const item = dataItem.get('item');
    const value = getValueForTransmit(dataItem.get('value'));

    if (PAGES[pageIndex] === 'overview') {
        const key = dataItem.get('row');
        const year = startYearMonth[0] + Math.floor((key + startYearMonth[1] - 1) / 12);
        const month = (startYearMonth[1] + key - 1) % 12 + 1;
        const balance = value;

        return requestList.push(map({
            pageIndex,
            req: map({
                method: 'post',
                route: 'balance',
                query: map.of(),
                body: map({ year, month, balance })
            })
        }));
    }

    if (LIST_PAGES.indexOf(pageIndex) > -1) {
        const id = dataItem.get('id');

        const reqPageIndex = requestList.findIndex(req => {
            return req.get('pageIndex') === pageIndex &&
                req.getIn(['req', 'body', 'id']) === id;
        });

        if (reqPageIndex > -1) {
            return requestList.setIn([reqPageIndex, 'req', 'body', item], value);
        }

        return requestList.push(map({
            pageIndex,
            req: map({
                method: 'put',
                route: PAGES[pageIndex],
                query: map.of(),
                body: map({ id, [item]: value })
            })
        }));
    }

    return requestList;
}

export function pushToRequestQueue(reduction, dataItem) {
    const startYearMonth = reduction.getIn(['pages', PAGES.indexOf('overview'), 'data', 'startYearMonth']);

    const requestList = reduction.getIn(['edit', 'requestList']);
    const newRequestList = addToRequestQueue(requestList, dataItem, startYearMonth || null);

    return reduction
        .setIn(['edit', 'requestList'], newRequestList);
}

