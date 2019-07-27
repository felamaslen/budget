import { connect } from 'react-redux';
import { DateTime } from 'luxon';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { getTickSize } from '~client/modules/format';
import { formatValue } from '~client/modules/funds';
import { rgba } from '~client/modules/color';

import styles from '~client/constants/styles.json';
import {
    GRAPH_FUNDS_WIDTH,
    GRAPH_FUNDS_HEIGHT,
    GRAPH_FUNDS_OVERALL_ID,
    GRAPH_FUNDS_MODE_ROI,
    GRAPH_FUNDS_MODE_ABSOLUTE,
    GRAPH_FUNDS_MODE_PRICE,
    GRAPH_FUNDS_NUM_TICKS,
    GRAPH_FUNDS_MODES
} from '~client/constants/graph';

import { fundsRequested } from '~client/actions/funds';
import { getPeriod } from '~client/selectors/funds';
import {
    getStartTime,
    getCacheTimes,
    getFundItems,
    getFundLines
} from '~client/selectors/funds/graph';

import {
    rangePropTypes,
    pixelPropTypes
} from '~client/prop-types/graph';
import { fundItemShape } from '~client/prop-types/page/funds';
import LineGraph from '~client/components/Graph/LineGraph';
import Axes from '~client/containers/GraphFunds/Axes';
import AfterCanvas from '~client/containers/GraphFunds/after-canvas';

import './style.scss';

const PADDING_DESKTOP = [36, 0, 0, 0];
const PADDING_MOBILE = [0, 0, 0, 0];

const makeGetRanges = ({
    mode,
    zoomRange: [zoomMin, zoomMax],
    lines,
    cacheTimes
}) => (zoomedLines = lines, minX = zoomMin, maxX = zoomMax) => {
    if (!(zoomedLines && cacheTimes.length >= 2)) {
        return { minX, maxX, minY: -1, maxY: 1 };
    }

    const valuesY = zoomedLines
        .map(({ data }) => data.map(([, yValue]) => yValue))
        .filter(values => values.length);

    let minY = 0;
    if (mode !== GRAPH_FUNDS_MODE_ABSOLUTE) {
        minY = valuesY.reduce((min, line) =>
            Math.min(min, line.reduce((last, value) => Math.min(last, value), min)), Infinity);
    }
    let maxY = valuesY.reduce((max, line) =>
        Math.max(max, line.reduce((last, value) => Math.max(last, value), max)), -Infinity);

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

    return { minX, maxX, minY, maxY, tickSizeY };
};

function makeBeforeLines({ mode, startTime, tickSizeY }) {
    const BeforeLines = ({ minY, maxY, minX, maxX, pixX, pixY }) => maxY !== 0 && (
        <Axes
            mode={mode}
            startTime={startTime}
            tickSizeY={tickSizeY}
            minY={minY}
            maxY={maxY}
            minX={minX}
            maxX={maxX}
            pixX={pixX}
            pixY={pixY}
        />
    );

    BeforeLines.propTypes = {
        ...rangePropTypes,
        ...pixelPropTypes
    };

    return BeforeLines;
}

const modeListAll = Object.keys(GRAPH_FUNDS_MODES);

function GraphFunds({
    isMobile,
    width,
    height,
    startTime,
    fundItems,
    fundLines,
    cacheTimes,
    period,
    changePeriod
}) {
    const haveData = cacheTimes.length > 0;

    const modeList = useMemo(() => {
        if (isMobile) {
            return modeListAll.filter(value => value !== GRAPH_FUNDS_MODE_PRICE);
        }

        return modeListAll;
    }, [isMobile]);

    const [mode, setMode] = useState(modeList[0]);
    const [toggleList, setToggleList] = useState({});
    const [numFundItems, setNumFundItems] = useState(0);

    useEffect(() => {
        if (fundItems.length !== numFundItems) {
            setNumFundItems(fundItems.length);

            setToggleList(lastList => fundItems.reduce((last, { id }) => ({
                [id]: true,
                ...last
            }), lastList));
        }
    }, [fundItems, numFundItems]);

    const filterFunds = useMemo(() => {
        if (isMobile) {
            return ({ id }) => id === GRAPH_FUNDS_OVERALL_ID;
        }

        return ({ id }) => toggleList[id] !== false;
    }, [isMobile, toggleList]);

    const [lines] = useMemo(() => {
        return fundLines[mode]
            .filter(filterFunds)
            .reduce(([last, idCount], { id, color, data }) => ([last.concat([{
                key: `${id}-${idCount[id] || 0}`,
                data,
                color: rgba(color),
                strokeWidth: id === GRAPH_FUNDS_OVERALL_ID
                    ? 2
                    : 1,
                smooth: mode !== GRAPH_FUNDS_MODE_ABSOLUTE
            }]), { ...idCount, [id]: (idCount[id] || 0) + 1 }]), [[], {}]);
    }, [fundLines, mode, filterFunds]);

    const getRanges = useMemo(() => {
        if (!haveData) {
            return () => ({
                minX: 0,
                maxX: 0,
                minY: 0,
                maxY: 0,
                tickSizeY: 0
            });
        }

        return makeGetRanges({
            mode,
            zoomRange: [0, cacheTimes[cacheTimes.length - 1]],
            lines,
            cacheTimes
        });
    }, [haveData, mode, cacheTimes, lines]);

    const {
        minX,
        maxX,
        minY,
        maxY,
        tickSizeY
    } = useMemo(getRanges, [getRanges]);

    const beforeLines = useMemo(() => {
        if (!haveData) {
            return () => null;
        }

        return makeBeforeLines({
            mode,
            startTime,
            tickSizeY
        });
    }, [haveData, mode, startTime, tickSizeY]);

    const after = useCallback(() => (
        <AfterCanvas
            isMobile={isMobile}
            period={period}
            mode={mode}
            fundItems={fundItems}
            toggleList={toggleList}
            setToggleList={setToggleList}
            changePeriod={changePeriod}
        />
    ), [isMobile, period, mode, fundItems, toggleList, setToggleList, changePeriod]);

    const labelX = useCallback(
        value => DateTime.fromJSDate(new Date(1000 * (value + startTime)))
            .toLocaleString(DateTime.DATE_SHORT),
        [startTime]
    );

    const labelY = useCallback(value => formatValue(value, mode), [mode]);

    const hoverEffect = useMemo(() => ({
        labelX,
        labelY
    }), [labelX, labelY]);

    const onClick = useCallback(() => setMode(last => modeList[(modeList.indexOf(last) + 1) % modeList.length]), [modeList]);

    const svgProperties = useMemo(() => ({ onClick }), [onClick]);

    const graphProps = {
        name: 'fund-history',
        isMobile,
        width,
        height,
        padding: isMobile
            ? PADDING_MOBILE
            : PADDING_DESKTOP,
        minX,
        maxX,
        minY,
        maxY,
        beforeLines,
        lines,
        after,
        svgProperties,
        hoverEffect,
        zoomEffect: getRanges
    };

    return <LineGraph {...graphProps} />;
}

GraphFunds.propTypes = {
    isMobile: PropTypes.bool,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    fundItems: PropTypes.arrayOf(fundItemShape.isRequired).isRequired,
    fundLines: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        color: PropTypes.arrayOf(PropTypes.number).isRequired,
        data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number.isRequired).isRequired).isRequired
    }).isRequired).isRequired).isRequired,
    startTime: PropTypes.number.isRequired,
    cacheTimes: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    period: PropTypes.string.isRequired,
    changePeriod: PropTypes.func.isRequired
};

GraphFunds.defaultProps = {
    startTime: 0
};

const mapStateToProps = (state, { isMobile }) => ({
    width: Math.min(state.app.windowWidth, GRAPH_FUNDS_WIDTH),
    height: isMobile
        ? styles.graphFundsHeightMobile
        : GRAPH_FUNDS_HEIGHT,
    fundItems: getFundItems(state),
    fundLines: getFundLines(state),
    startTime: getStartTime(state),
    cacheTimes: getCacheTimes(state),
    period: getPeriod(state)
});

const mapDispatchToProps = dispatch => ({
    changePeriod: period => dispatch(fundsRequested(true, period))
});

export default connect(mapStateToProps, mapDispatchToProps)(GraphFunds);
