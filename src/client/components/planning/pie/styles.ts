import styled from '@emotion/styled';
import { breakpoint } from '~client/styled/mixins';
import { breakpoints } from '~client/styled/variables';

export const PlanningPieChart = styled.div`
  display: none;

  ${breakpoint(breakpoints.mobile)} {
    display: block;
    grid-column: 2 / span 2;
    grid-row: 2;
    position: relative;
    margin-left: auto;
  }
`;
