import React from 'react';
import PropTypes from 'prop-types';

import { netWorthList } from '~client/prop-types/net-worth/list';
import { category, subcategory } from '~client/prop-types/net-worth/category';
import CrudList from '~client/components/CrudList';
import NetWorthListItem from '~client/components/NetWorthList/net-worth-list-item';
import NetWorthListCreateItem from '~client/components/NetWorthList/net-worth-list-create-item';

import './style.scss';

export default function NetWorthList({
    data,
    categories,
    subcategories,
    onCreate,
    onUpdate,
    onDelete
}) {
    const extraProps = {
        data,
        categories,
        subcategories
    };

    return (
        <div className="net-worth-list">
            <h4 className="title">{'List'}</h4>
            <CrudList
                items={data}
                Item={NetWorthListItem}
                CreateItem={NetWorthListCreateItem}
                onCreate={onCreate}
                onUpdate={onUpdate}
                onDelete={onDelete}
                className="net-worth-item"
                extraProps={extraProps}
            />
        </div>
    );
}

NetWorthList.propTypes = {
    data: netWorthList,
    categories: PropTypes.arrayOf(category.isRequired),
    subcategories: PropTypes.arrayOf(subcategory.isRequired),
    onCreate: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};
