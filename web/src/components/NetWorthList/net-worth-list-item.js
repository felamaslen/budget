import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';

import { netWorthItem } from '~client/prop-types/net-worth/list';
import { category, subcategory } from '~client/prop-types/net-worth/category';
import { NetWorthEditForm } from '~client/components/NetWorthEditForm';

function NetWorthListItem({
    item,
    categories,
    subcategories,
    active,
    noneActive,
    setActive,
    onUpdate,
    onDelete
}) {
    const onActivate = useCallback(() => setActive(item.id), [item.id, setActive]);

    if (noneActive) {
        return (
            <div
                className="net-worth-list-item-summary"
                onClick={onActivate}
            >
                <span className="entry-title">{item.date.toISODate()}</span>
                <span className="button-delete">
                    <button
                        className="button-delete-button"
                        onClick={onDelete}
                    >&minus;</button>
                </span>
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
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default memo(NetWorthListItem);
