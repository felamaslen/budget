import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { rowsShape, dailyTotalsShape } from '~client/prop-types/page/rows';

import { useSuggestions } from '~client/hooks/suggestions';
import CrudList from '~client/components/CrudList';
import ListHeadDesktop from '~client/components/ListHeadDesktop';
import ListHeadMobile from '~client/components/ListHeadMobile';
import ListFootMobile from '~client/components/ListFootMobile';
import ListRowDesktop from '~client/components/ListRowDesktop';
import ListRowMobile from '~client/components/ListRowMobile';
import ListCreateDesktop from '~client/components/ListCreateDesktop';

export default function ListBody({
    apiKey,
    page,
    isMobile,
    rows,
    getDaily,
    dailyTotals,
    weeklyValue,
    totalCost,
    extraProps: pageExtraProps,
    onCreate,
    onUpdate,
    onDelete
}) {
    const [
        suggestions,
        clearSuggestions,
        refreshSuggestions
    ] = useSuggestions({ apiKey, page });

    const extraProps = useMemo(() => ({
        page,
        suggestions,
        clearSuggestions,
        refreshSuggestions,
        getDaily,
        dailyTotals,
        weeklyValue,
        totalCost,
        ...pageExtraProps
    }), [
        page,
        suggestions,
        clearSuggestions,
        refreshSuggestions,
        getDaily,
        dailyTotals,
        weeklyValue,
        totalCost,
        pageExtraProps
    ]);

    const [Item, CreateItem, className, BeforeList, AfterList] = useMemo(() => {
        if (isMobile) {
            return [
                ListRowMobile,
                null,
                'list-mobile',
                ListHeadMobile,
                ListFootMobile
            ];
        }

        return [
            ListRowDesktop,
            ListCreateDesktop,
            'list-body',
            ListHeadDesktop,
            null
        ];
    }, [isMobile]);

    return (
        <CrudList
            items={rows}
            reverse
            nav={!isMobile}
            Item={Item}
            CreateItem={CreateItem}
            BeforeList={BeforeList}
            AfterList={AfterList}
            className={className}
            extraProps={extraProps}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onDelete={onDelete}
        />
    );
}

ListBody.propTypes = {
    apiKey: PropTypes.string,
    page: PropTypes.string.isRequired,
    isMobile: PropTypes.bool.isRequired,
    rows: rowsShape,
    getDaily: PropTypes.bool,
    dailyTotals: dailyTotalsShape,
    weeklyValue: PropTypes.number,
    totalCost: PropTypes.number,
    extraProps: PropTypes.object,
    onCreate: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

ListBody.defaultProps = {
    extraProps: {},
    dailyTotals: {}
};
