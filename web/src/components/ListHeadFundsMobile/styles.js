import styled from 'styled-components';
import { colors } from '~client/styled/variables';

export const FundsInfoInner = styled.div`
    display: flex;
    flex-flow: column;
`;
export const Gain = styled.div`
    display: flex;
    padding: 6px 12px 2px;
    flex-flow: row wrap;
    align-items: center;
    flex: 0 0 auto;
    overflow: hidden;
    background: ${({ gain }) => {
        if (gain > 0) {
            return colors['profit-translucent'];
        }
        if (gain < 0) {
            return colors['loss-translucent'];
        }

        return colors['translucent-l7'];
    }};
`;
export const GainInfo = styled.span`
    display: none;
`;
export const Value = styled.span`
    flex-grow: 3;
    font-size: 150%;
    font-weight: bold;
`;
export const GainPct = styled.span`
    flex-grow: 1;
    font-weight: bold;
    font-style: italic;
    text-align: right;
`;
export const CacheAge = styled.span`
    flex-grow: 1;
    flex-wrap: wrap;
    color: ${colors['very-dark']};
    font-style: italic;
    text-align: right;
    font-size: 80%;
`;
