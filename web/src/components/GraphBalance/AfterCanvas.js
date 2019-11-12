import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import * as Styled from './styles';

export default function AfterCanvas({ showAll, setShowAll }) {
    const onClick = useCallback(() => setShowAll(!showAll), [
        showAll,
        setShowAll,
    ]);

    return (
        <Styled.ShowAll onClick={onClick}>
            <span>{'Show all'}</span>
            <Styled.CheckBox enabled={showAll} />
        </Styled.ShowAll>
    );
}

AfterCanvas.propTypes = {
    showAll: PropTypes.bool.isRequired,
    setShowAll: PropTypes.func.isRequired,
};
