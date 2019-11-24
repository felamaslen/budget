import React from 'react';
import PropTypes from 'prop-types';

import { netWorthList } from '~client/prop-types/net-worth/list';
import { category, subcategory } from '~client/prop-types/net-worth/category';
import CrudList from '~client/components/CrudList';
import NetWorthListItem from '~client/components/NetWorthList/net-worth-list-item';
import NetWorthListCreateItem from '~client/components/NetWorthList/net-worth-list-create-item';

import * as Styled from './styles';

export default function NetWorthList({
    data,
    categories,
    subcategories,
    onCreate,
    onUpdate,
    onDelete,
}) {
    const extraProps = {
        data,
        categories,
        subcategories,
    };

    return (
        <Styled.NetWorthList>
            <CrudList
                items={data}
                real
                Item={NetWorthListItem}
                CreateItem={NetWorthListCreateItem}
                onCreate={onCreate}
                onUpdate={onUpdate}
                onDelete={onDelete}
                extraProps={extraProps}
            />
        </Styled.NetWorthList>
    );
}

NetWorthList.propTypes = {
    data: netWorthList,
    categories: PropTypes.arrayOf(category.isRequired),
    subcategories: PropTypes.arrayOf(subcategory.isRequired),
    onCreate: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};
