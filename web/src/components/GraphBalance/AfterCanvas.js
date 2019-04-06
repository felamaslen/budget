import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function AfterCanvas({ showAll, setShowAll }) {
    const className = classNames('show-all', 'noselect', {
        noselect: true,
        enabled: showAll
    });

    const onClick = useCallback(() => setShowAll(!showAll), [showAll, setShowAll]);

    return <span className={className} onClick={onClick}>
        <span>{'Show all'}</span>
        <a className="checkbox" />
    </span>;
}

AfterCanvas.propTypes = {
    showAll: PropTypes.bool.isRequired,
    setShowAll: PropTypes.func.isRequired
};

