import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as Styled from './styles';

export default function AfterCanvas({ showAll, setShowAll }) {
    const className = classNames('show-all', {
        enabled: showAll,
    });

    const onClick = useCallback(() => setShowAll(!showAll), [
        showAll,
        setShowAll,
    ]);

    return (
        <Styled.ShowAll className={className} onClick={onClick}>
            <span>{'Show all'}</span>
            <a className="checkbox" />
        </Styled.ShowAll>
    );
}

AfterCanvas.propTypes = {
    showAll: PropTypes.bool.isRequired,
    setShowAll: PropTypes.func.isRequired,
};
