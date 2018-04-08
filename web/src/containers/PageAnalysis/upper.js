import { connect } from 'react-redux';
import { aOptionChanged } from '../../actions/analysis.actions';
import React from 'react';
import PropTypes from 'prop-types';
import { ANALYSIS_PERIODS, ANALYSIS_GROUPINGS } from '../../constants/analysis';

export function Upper({ periodKey, groupingKey, timeIndex, description, changeOption }) {
    const changePeriod = key => changeOption(key, groupingKey, 0);
    const changeGrouping = key => changeOption(periodKey, key, timeIndex);
    const changeTimeIndex = delta => changeOption(periodKey, groupingKey, timeIndex + delta);

    const periodSwitcher = ANALYSIS_PERIODS.map((item, key) => <span key={item}>
        <input type="radio" checked={periodKey === key}
            onChange={() => changePeriod(key)} />
        <span>{item}</span>
    </span>);

    const groupingSwitcher = ANALYSIS_GROUPINGS.map((item, key) => <span key={item}>
        <input type="radio" checked={groupingKey === key}
            onChange={() => changeGrouping(key)} />
        <span>{item}</span>
    </span>);

    return <div className="upper">
        <span className="input-period">
            <span>{'Period:'}</span>
            {periodSwitcher}
        </span>
        <span className="input-grouping">
            <span>{'Grouping:'}</span>
            {groupingSwitcher}
        </span>
        <div className="btns">
            <button className="btn-previous"
                onClick={() => changeTimeIndex(1)}>{'Previous'}</button>
            <button className="btn-next" disabled={timeIndex === 0}
                onClick={() => changeTimeIndex(-1)}>{'Next'}</button>
        </div>
        <h3 className="period-title">{description}</h3>
    </div>;
}

Upper.propTypes = {
    periodKey: PropTypes.number.isRequired,
    groupingKey: PropTypes.number.isRequired,
    timeIndex: PropTypes.number.isRequired,
    description: PropTypes.string,
    changeOption: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    periodKey: state.getIn(['other', 'analysis', 'period']),
    groupingKey: state.getIn(['other', 'analysis', 'grouping']),
    timeIndex: state.getIn(['other', 'analysis', 'timeIndex']),
    description: state.getIn(['pages', 'analysis', 'description'])
});

const mapDispatchToProps = dispatch => ({
    changeOption: (period, grouping, timeIndex) =>
        dispatch(aOptionChanged({ period, grouping, timeIndex }))
});

export default connect(mapStateToProps, mapDispatchToProps)(Upper);

