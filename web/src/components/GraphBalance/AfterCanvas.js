import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import * as Styled from './styles';

export default function AfterCanvas({ showAll, setShowAll }) {
    const skip = useCallback(event => {
        event.stopPropagation();
        event.preventDefault();
    }, []);

    const onToggle = useCallback(
        event => {
            skip(event);
            setShowAll(last => !last);
        },
        [setShowAll, skip],
    );

    return (
        <Styled.ShowAll
            onClick={onToggle}
            onMouseMove={skip}
            onMouseOver={skip}
            onMouseOut={skip}
            onTouchStart={skip}
            onTouchMove={skip}
            onTouchEnd={skip}
        >
            <span>{'Show all'}</span>
            <Styled.CheckBox enabled={showAll} />
        </Styled.ShowAll>
    );
}

AfterCanvas.propTypes = {
    showAll: PropTypes.bool.isRequired,
    setShowAll: PropTypes.func.isRequired,
};
