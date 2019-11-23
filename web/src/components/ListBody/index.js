import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { rowsShape } from '~client/prop-types/page/rows';
import { itemHeightDesktop, itemHeightMobile } from '~client/constants/styles.json';
import CrudList from '~client/components/CrudList';
import ListHeadDesktop from '~client/components/ListHeadDesktop';
import ListHeadMobile from '~client/components/ListHeadMobile';
import ListFootMobile from '~client/components/ListFootMobile';
import ListRowDesktop from '~client/components/ListRowDesktop';
import ListRowMobile from '~client/components/ListRowMobile';
import ListCreateDesktop from '~client/components/ListCreateDesktop';

export default function ListBody({ isMobile, rows, itemSize, onCreate, onUpdate, onDelete }) {
    const [Item, CreateItem, className, BeforeList, AfterList] = useMemo(() => {
        if (isMobile) {
            return [ListRowMobile, null, 'list-mobile', ListHeadMobile, ListFootMobile];
        }

        return [ListRowDesktop, ListCreateDesktop, 'list-desktop', ListHeadDesktop, null];
    }, [isMobile]);

    const defaultItemSize = isMobile ? itemHeightMobile : itemHeightDesktop;

    return (
        <CrudList
            items={rows}
            itemSize={itemSize || defaultItemSize}
            nav={!isMobile}
            Item={Item}
            CreateItem={CreateItem}
            BeforeList={BeforeList}
            AfterList={AfterList}
            className={className}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onDelete={onDelete}
        />
    );
}

ListBody.propTypes = {
    isMobile: PropTypes.bool.isRequired,
    rows: rowsShape,
    itemSize: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    getDaily: PropTypes.bool,
    weeklyValue: PropTypes.number,
    onCreate: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};
