import React from 'react';
import PropTypes from 'prop-types';

export default function NetWorthListCreateItem({
    active,
    onCreate
}) {
    return (
        <div className="net-worth-list-create-item">
        </div>
    );
}

NetWorthListCreateItem.propTypes = {
    active: PropTypes.bool.isRequired,
    onCreate: PropTypes.func.isRequired
};
