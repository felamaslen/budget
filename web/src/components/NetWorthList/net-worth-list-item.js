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
    noneActive,
    setActive,
    onUpdate
}) {
    if (noneActive) {
        return (
            <div className="net-worth-list-item-summary">
                {'Entry from date '}{item.date.toISODate()}
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
            setActiveId={setActive}
            onUpdate={onUpdate}
        />
    );
}

NetWorthListItem.propTypes = {
    item: netWorthItem.isRequired,
    categories: PropTypes.arrayOf(category.isRequired).isRequired,
    subcategories: PropTypes.arrayOf(subcategory.isRequired).isRequired,
    active: PropTypes.bool.isRequired,
    noneActive: PropTypes.bool.isRequired,
    setActive: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired
};
