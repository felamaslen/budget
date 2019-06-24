import React from 'react';
import PropTypes from 'prop-types';

import { netWorthItem } from '~client/prop-types/net-worth/list';
import { category, subcategory } from '~client/prop-types/net-worth/category';
import { NetWorthEditForm } from '~client/components/NetWorthEditForm';

export default function NetWorthListItem({
    item,
    categories,
    subcategories,
    active,
    activeId,
    setActiveId,
    onUpdate
}) {
    if (activeId === null) {
        return (
            <div className="net-worth-list-item-summary">
                {'Entry from date '}{item.date}
            </div>
        );
    }

    if (!active) {
        return null;
    }

    return (
        <NetWorthEditForm
            item={item}
            categories={categories}
            subcategories={subcategories}
            setActiveId={setActiveId}
            onUpdate={onUpdate}
        />
    );
}

NetWorthListItem.propTypes = {
    item: netWorthItem.isRequired,
    categories: PropTypes.arrayOf(category.isRequired).isRequired,
    subcategories: PropTypes.arrayOf(subcategory.isRequired).isRequired,
    active: PropTypes.bool.isRequired,
    activeId: PropTypes.string,
    setActiveId: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired
};
