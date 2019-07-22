import React from 'react';
import PropTypes from 'prop-types';

import { netWorthItem } from '~client/prop-types/net-worth/list';
import { category, subcategory } from '~client/prop-types/net-worth/category';
import { NetWorthAddForm } from '~client/components/NetWorthEditForm';

export default function NetWorthListCreateItem({
    data,
    categories,
    subcategories,
    active,
    setActive,
    noneActive,
    onCreate
}) {
    if (noneActive) {
        return (
            <div className="net-worth-list-item-summary">
                {'Add a new entry'}
            </div>
        );
    }
    if (!active) {
        return null;
    }

    return (
        <NetWorthAddForm
            data={data}
            categories={categories}
            subcategories={subcategories}
            setActiveId={setActive}
            onCreate={onCreate}
        />
    );
}

NetWorthListCreateItem.propTypes = {
    data: PropTypes.arrayOf(netWorthItem.isRequired).isRequired,
    categories: PropTypes.arrayOf(category.isRequired).isRequired,
    subcategories: PropTypes.arrayOf(subcategory.isRequired).isRequired,
    active: PropTypes.bool.isRequired,
    setActive: PropTypes.func.isRequired,
    noneActive: PropTypes.bool.isRequired,
    onCreate: PropTypes.func.isRequired
};
