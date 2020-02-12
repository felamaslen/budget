import React, { useCallback } from 'react';

import * as Styled from './styles';

type IProps = {
    showAll: boolean;
    setShowAll: (value: boolean | ((lastValue: boolean) => boolean)) => void;
};

const AfterCanvas: React.FunctionComponent<IProps> = ({ showAll, setShowAll }) => {
    const skip = useCallback(event => {
        event.stopPropagation();
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
};

export default AfterCanvas;
