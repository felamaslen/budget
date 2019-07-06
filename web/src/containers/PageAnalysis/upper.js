import React from 'react';
import PropTypes from 'prop-types';

import { ANALYSIS_PERIODS, ANALYSIS_GROUPINGS } from '~client/constants/analysis';

const Upper = ({ period, grouping, page, description, onRequest }) => (
    <div className="upper">
        <span className="input-period">
            <span>{'Period:'}</span>
            {ANALYSIS_PERIODS.map(value => (
                <span key={value}>
                    <input type="radio"
                        checked={value === period}
                        onChange={() => onRequest({ period: value })}
                    />
                    <span>{value}</span>
                </span>
            ))}
        </span>
        <span className="input-grouping">
            <span>{'Grouping:'}</span>
            {ANALYSIS_GROUPINGS.map(value => (
                <span key={value}>
                    <input type="radio"
                        checked={value === grouping}
                        onChange={() => onRequest({ grouping: value })}
                    />
                    <span>{value}</span>
                </span>
            ))}
        </span>
        <div className="btns">
            <button className="btn-previous"
                onClick={() => onRequest({ page: page + 1 })}
            >{'Previous'}</button>
            <button className="btn-next"
                disabled={page === 0}
                onClick={() => onRequest({ page: page - 1 })}
            >{'Next'}</button>
        </div>
        <h3 className="period-title">{description}</h3>
    </div>
);

Upper.propTypes = {
    period: PropTypes.string.isRequired,
    grouping: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    description: PropTypes.string,
    onRequest: PropTypes.func.isRequired
};

export default Upper;
