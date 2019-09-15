import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { fundItemShape } from '~client/prop-types/page/funds';
import { GRAPH_FUNDS_MODES, GRAPH_FUNDS_PERIODS } from '~client/constants/graph';
import { rgba } from '~client/modules/color';

function FundItem({
    toggleList, setToggleList, id, color, item,
}) {
    const onToggle = useCallback(() => setToggleList((last) => ({
        ...last,
        [id]: last[id] === false,
    })), [id, setToggleList]);

    const style = { borderColor: rgba(color) };

    return (
        <li className={classNames({ enabled: toggleList[id] !== false })} onClick={onToggle}>
            <span className="checkbox" style={style}></span>
            <span className="fund">{item}</span>
        </li>
    );
}

FundItem.propTypes = {
    toggleList: PropTypes.objectOf(PropTypes.bool.isRequired).isRequired,
    setToggleList: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    color: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    item: PropTypes.string.isRequired,
};

function AfterCanvas({
    isMobile, period, mode, fundItems, toggleList, setToggleList, changePeriod,
}) {
    const onChange = useCallback((evt) => changePeriod(evt.target.value), [changePeriod]);

    return (
        <div className="after-canvas">
            {!isMobile && <ul className="fund-sidebar noselect">
                <li>
                    <select defaultValue={period} onChange={onChange}>
                        {GRAPH_FUNDS_PERIODS.map(([value, display]) => (
                            <option key={value} value={value}>{display}</option>
                        ))}
                    </select>
                </li>
                {fundItems && fundItems.map((item) => (
                    <FundItem key={item.id}
                        {...item}
                        toggleList={toggleList}
                        setToggleList={setToggleList}
                    />
                ))}
            </ul>}
            <span className="mode">
                {'Mode: '}{GRAPH_FUNDS_MODES[mode]}
            </span>
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
