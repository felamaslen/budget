import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { rgb } from 'polished';

import { fundItemShape } from '~client/prop-types/page/funds';
import { GRAPH_FUNDS_MODES, GRAPH_FUNDS_PERIODS } from '~client/constants/graph';

import * as Styled from './styles';

function FundItem({ numItems, toggleList, setToggleList, id, color, item }) {
    const onToggle = useCallback(
        () =>
            setToggleList(last => {
                const next = { ...last, [id]: last[id] === false };
                if (
                    Object.keys(next).length === numItems &&
                    Object.keys(next).every(value => !next[value])
                ) {
                    return last;
                }

                return next;
            }),
        [id, setToggleList, numItems],
    );

    return (
        <li onClick={onToggle}>
            <Styled.SidebarCheckbox
                style={{
                    borderColor: rgb(...color),
                }}
                checked={toggleList[id] !== false}
            ></Styled.SidebarCheckbox>
            <Styled.SidebarFund>{item}</Styled.SidebarFund>
        </li>
    );
}

FundItem.propTypes = {
    numItems: PropTypes.number.isRequired,
    toggleList: PropTypes.objectOf(PropTypes.bool.isRequired).isRequired,
    setToggleList: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    color: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    item: PropTypes.string.isRequired,
};

function AfterCanvas({
    isMobile,
    period,
    mode,
    fundItems,
    toggleList,
    setToggleList,
    changePeriod,
}) {
    const onChange = useCallback(evt => changePeriod(evt.target.value), [changePeriod]);

    return (
        <div>
            {!isMobile && (
                <Styled.FundSidebar>
                    <li>
                        <select defaultValue={period} onChange={onChange}>
                            {GRAPH_FUNDS_PERIODS.map(([value, display]) => (
                                <option key={value} value={value}>
                                    {display}
                                </option>
                            ))}
                        </select>
                    </li>
                    {fundItems &&
                        fundItems.map(item => (
                            <FundItem
                                key={item.id}
                                numItems={fundItems.length}
                                {...item}
                                toggleList={toggleList}
                                setToggleList={setToggleList}
                            />
                        ))}
                </Styled.FundSidebar>
            )}
            <Styled.Mode>
                {'Mode: '}
                {GRAPH_FUNDS_MODES[mode]}
            </Styled.Mode>
        </div>
    );
}

AfterCanvas.propTypes = {
    isMobile: PropTypes.bool.isRequired,
    period: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    fundItems: PropTypes.arrayOf(fundItemShape.isRequired).isRequired,
    toggleList: PropTypes.objectOf(PropTypes.bool.isRequired).isRequired,
    setToggleList: PropTypes.func.isRequired,
    changePeriod: PropTypes.func.isRequired,
};

export default React.memo(AfterCanvas);
