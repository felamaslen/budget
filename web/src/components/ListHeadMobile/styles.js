import styled from 'styled-components';
import { Column } from '~client/components/ListRowMobile/styles';

export const ListHead = styled.div`
    display: flex;
    flex: 0 0 28px;
    align-items: center;
    flex-flow: row nowrap;
    width: 100%;
    font-weight: bold;
    user-select: none;
`;

export const Header = styled(Column)`
    text-align: center;
`;
