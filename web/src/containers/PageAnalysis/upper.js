import React from 'react';
import PropTypes from 'prop-types';

import { ANALYSIS_PERIODS, ANALYSIS_GROUPINGS } from '~client/constants/analysis';

import * as Styled from './styles';

const Upper = ({
    period, grouping, page, description, onRequest,
}) => (
    <Styled.Upper>
        <Styled.Input>
            <span>{'Period:'}</span>
            {ANALYSIS_PERIODS.map((value) => (
                <span key={value}>
                    <input type="radio"
                        checked={value === period}
                        onChange={() => onRequest({ period: value })}
                    />
                    <span>{value}</span>
                </span>
            ))}
        </Styled.Input>
        <Styled.Input>
            <span>{'Grouping:'}</span>
            {ANALYSIS_GROUPINGS.map((value) => (
                <span key={value}>
                    <input type="radio"
                        checked={value === grouping}
                        onChange={() => onRequest({ grouping: value })}
                    />
                    <span>{value}</span>
                </span>
            ))}
        </Styled.Input>
        <Styled.Buttons>
            <Styled.Button onClick={() => onRequest({ page: page + 1 })}>
                Previous
            </Styled.Button>
            <Styled.Button
                disabled={page === 0}
                onClick={() => onRequest({ page: page - 1 })}
            >
                Next
            </Styled.Button>
        </Styled.Buttons>
        <Styled.PeriodTitle>{description}</Styled.PeriodTitle>
    </Styled.Upper>
);

Upper.propTypes = {
    period: PropTypes.string.isRequired,
    grouping: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    description: PropTypes.string,
    onRequest: PropTypes.func.isRequired,
};

export default React.memo(Upper);
