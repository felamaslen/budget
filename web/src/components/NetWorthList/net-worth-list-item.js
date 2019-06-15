import React from 'react';
import PropTypes from 'prop-types';

import { netWorthItem } from '~client/components/NetWorthList/prop-types';

export default function NetWorthListItem({
    item,
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
        <div className="net-worth-list-item">
            <pre>{JSON.stringify(item, null, 2)}</pre>
        </div>
    );
}

NetWorthListItem.propTypes = {
    item: netWorthItem.isRequired,
    active: PropTypes.bool.isRequired,
    activeId: PropTypes.number,
    setActiveId: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired
};
