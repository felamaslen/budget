import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function AfterCanvas({ showAll, onShowAll }) {
    const className = classNames('show-all', 'noselect', {
        noselect: true,
        enabled: showAll
    });

    const onClick = () => onShowAll();

    return <span className={className} onClick={onClick}>
        <span>{'Show all'}</span>
        <a className="checkbox" />
    </span>;
}

AfterCanvas.propTypes = {
    showAll: PropTypes.bool.isRequired,
    onShowAll: PropTypes.func.isRequired
};

