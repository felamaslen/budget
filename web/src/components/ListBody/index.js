import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { rowsShape } from '~client/prop-types/page/rows';

import CrudList from '~client/components/CrudList';
import ListHeadDesktop from '~client/components/ListHeadDesktop';
import ListHeadMobile from '~client/components/ListHeadMobile';
import ListFootMobile from '~client/components/ListFootMobile';
import ListRowDesktop from '~client/components/ListRowDesktop';
import ListRowMobile from '~client/components/ListRowMobile';
import ListCreateDesktop from '~client/components/ListCreateDesktop';

const getItemClassName = ({ future, firstPresent, className = '' }) => ({
    future,
    'first-present': firstPresent,
    [className]: className
});

export default function ListBody({
    page,
    isMobile,
    rows,
    getDaily,
    weeklyValue,
    totalCost,
    extraProps: pageExtraProps,
    onCreate,
    onUpdate,
    onDelete
}) {
    const extraProps = useMemo(() => ({
        page,
        getDaily,
        weeklyValue,
        totalCost,
        ...pageExtraProps
    }), [
        page,
        getDaily,
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
            itemClassName={getItemClassName}
            extraProps={extraProps}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onDelete={onDelete}
        />
    );
}

ListBody.propTypes = {
    page: PropTypes.string.isRequired,
    isMobile: PropTypes.bool.isRequired,
    rows: rowsShape,
    getDaily: PropTypes.bool,
    weeklyValue: PropTypes.number,
    totalCost: PropTypes.number,
    extraProps: PropTypes.object,
    onCreate: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

ListBody.defaultProps = {
    extraProps: {}
};
