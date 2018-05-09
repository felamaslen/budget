/*
 * Graph general cash flow (balance over time)
 */

import { Map as map, List as list } from 'immutable';
import { connect } from 'react-redux';
import { DateTime } from 'luxon';
import { aFundsGraphClicked, aFundsGraphLineToggled, aFundsGraphPeriodChanged } from '../../actions/graph.actions';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import LineGraph from '../../components/Graph/LineGraph';
import { getTickSize } from '../../helpers/format';
import {
    GRAPH_FUNDS_WIDTH, GRAPH_FUNDS_HEIGHT,
    GRAPH_FUNDS_MODE_ROI, GRAPH_FUNDS_MODE_PRICE,
    GRAPH_FUNDS_NUM_TICKS, GRAPH_FUNDS_PERIODS, GRAPH_FUNDS_MODES
} from '../../constants/graph';
import { graphFundsHeightMobile } from '../../constants/styles';
import { rgba } from '../../helpers/color';
import { formatValue } from '../../helpers/funds';
import Axes from './Axes';

function AfterCanvas({ period, mode, fundItems, toggleLine, changePeriod }) {
    const fundLineToggles = fundItems
        ? fundItems.map((item, key) => {
            const className = classNames({ enabled: item.get('enabled') });
            const onClick = () => toggleLine(key);
            const style = {
                borderColor: rgba(item.get('color'))
            };

            return <li key={key} className={className} onClick={onClick}>
                <span className="checkbox" style={style}></span>
                <span className="fund">{item.get('item')}</span>
            </li>;
        })
        : null;

    const onChange = evt => changePeriod({
        shortPeriod: evt.target.value,
        reloadPagePrices: false
    });

    const periodOptions = GRAPH_FUNDS_PERIODS.map(([value, display], key) => (
        <option key={key} value={value}>{display}</option>
    ));

    return (
        <div className="after-canvas">
            <ul className="fund-sidebar noselect">
                <li>
                    <select defaultValue={period} onChange={onChange}>
                        {periodOptions}
                    </select>
                </li>
                {fundLineToggles}
            </ul>
            <span className="mode">
                {'Mode: '}{GRAPH_FUNDS_MODES[mode]}
            </span>
        </div>
    );
}

AfterCanvas.propTypes = {
    period: PropTypes.string.isRequired,
    mode: PropTypes.number.isRequired,
    fundItems: PropTypes.instanceOf(list).isRequired,
    toggleLine: PropTypes.func.isRequired,
    changePeriod: PropTypes.func.isRequired
};

function getLines({ isMobile, fundLines, fundItems, mode }) {
    return fundLines.reduce((lines, item) => {
        const mainLine = item.get('index') === 0;
        if (isMobile && !mainLine && mode !== GRAPH_FUNDS_MODE_PRICE) {
            return lines;
        }

        const color = rgba(fundItems.getIn([item.get('index'), 'color']));

        const strokeWidth = 1 + 0.5 * (mainLine >> 0);

        const itemLines = item.get('line').map((data, key) => map({
            key: `${item.get('index')}-${key}`,
            data,
            smooth: mode === GRAPH_FUNDS_MODE_ROI,
            color,
            strokeWidth
        }));

        return lines.concat(itemLines);

    }, list.of());
}

function processData(props) {
    const { mode, zoomRange, fundLines, cacheTimes } = props;

    const minX = zoomRange.get(0);
    const maxX = zoomRange.get(1);

    if (!(fundLines && cacheTimes.size >= 2)) {
        return { minX, maxX, minY: -1, maxY: 1 };
    }

    const lines = getLines(props);
    const valuesY = lines.map(line => line.get('data').map(item => item.get(1)));

    let minY = valuesY.reduce((min, line) => Math.min(min, line.min()), Infinity);
    let maxY = valuesY.reduce((max, line) => Math.max(max, line.max()), -Infinity);

    if (minY === maxY) {
        minY -= 0.5;
        maxY += 0.5;
    }
    if (mode === GRAPH_FUNDS_MODE_ROI && minY === 0) {
        minY = -maxY * 0.2;
    }

    // get the tick size for the new range
    const tickSizeY = getTickSize(minY, maxY, GRAPH_FUNDS_NUM_TICKS);

    if (!isNaN(tickSizeY)) {
        minY = tickSizeY * Math.floor(minY / tickSizeY);
        maxY = tickSizeY * Math.ceil(maxY / tickSizeY);
    }

    return { minX, maxX, minY, maxY, lines, tickSizeY };
}

export function GraphFunds({ zoomRange, ...props }) {
    const beforeLines = subProps => <Axes {...subProps} />;

    let after = null;
    if (!props.isMobile) {
        after = <AfterCanvas {...props} />;
    }

    const graphProps = {
        padding: [36 * (!props.isMobile >> 0), 0, 0, 0],
        beforeLines,
        after,
        svgProperties: { onClick: () => props.onClick },
        hoverEffect: {
            labelX: (value, { startTime }) =>
                DateTime.fromJSDate(new Date(1000 * (value + startTime)))
                    .toLocaleString(DateTime.DATE_SHORT),
            labelY: (value, { mode }) => formatValue(value, mode)
        },
        zoomEffect: {
            minX: zoomRange.get(0),
            maxX: zoomRange.get(1)
        },
        ...processData({ zoomRange, ...props }),
        ...props
    };

    return <LineGraph {...graphProps} />;
}

GraphFunds.propTypes = {
    isMobile: PropTypes.bool,
    fundHistoryCache: PropTypes.instanceOf(map),
    fundItems: PropTypes.instanceOf(list),
    fundLines: PropTypes.instanceOf(list),
    startTime: PropTypes.number,
    cacheTimes: PropTypes.instanceOf(list),
    zoomRange: PropTypes.instanceOf(list),
    funds: PropTypes.instanceOf(list),
    mode: PropTypes.number.isRequired,
    period: PropTypes.string,
    showOverall: PropTypes.bool,
    onClick: PropTypes.func.isRequired
};

const mapStateToProps = (state, { isMobile }) => ({
    name: 'fund-history',
    width: Math.min(state.getIn(['other', 'windowWidth']), GRAPH_FUNDS_WIDTH),
    height: isMobile
        ? graphFundsHeightMobile
        : GRAPH_FUNDS_HEIGHT,
    fundHistoryCache: state.getIn(['other', 'fundHistoryCache']),
    fundItems: state.getIn(['other', 'graphFunds', 'data', 'fundItems']),
    fundLines: state.getIn(['other', 'graphFunds', 'data', 'fundLines']),
    startTime: state.getIn(['other', 'graphFunds', 'startTime']),
    cacheTimes: state.getIn(['other', 'graphFunds', 'cacheTimes']),
    zoomRange: state.getIn(['other', 'graphFunds', 'zoomRange']),
    mode: state.getIn(['other', 'graphFunds', 'mode']),
    period: state.getIn(['other', 'graphFunds', 'period']),
    showOverall: state.getIn(['other', 'graphFunds', 'showOverall'])
});

const mapDispatchToProps = dispatch => ({
    toggleLine: key => dispatch(aFundsGraphLineToggled(key)),
    changePeriod: req => dispatch(aFundsGraphPeriodChanged(req)),
    onClick: () => dispatch(aFundsGraphClicked())
});

export default connect(mapStateToProps, mapDispatchToProps)(GraphFunds);

