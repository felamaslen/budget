import React from 'react';
import PropTypes from 'prop-types';

import { netWorthItem } from '~client/components/NetWorthList/prop-types';
import { category, subcategory } from '~client/components/NetWorthCategoryList/prop-types';
import { NetWorthAddForm } from '~client/components/NetWorthEditForm';

export default function NetWorthListCreateItem({
    data,
    categories,
    subcategories,
    active,
    activeId,
    setActiveId,
    onCreate
}) {
    if (activeId === null) {
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
            setActiveId={setActiveId}
            onCreate={onCreate}
        />
    );
}

NetWorthListCreateItem.propTypes = {
    data: PropTypes.arrayOf(netWorthItem.isRequired).isRequired,
    categories: PropTypes.arrayOf(category.isRequired).isRequired,
    subcategories: PropTypes.arrayOf(subcategory.isRequired).isRequired,
    active: PropTypes.bool.isRequired,
    activeId: PropTypes.string,
    setActiveId: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired
};
