import styled from 'styled-components';

export const Page = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 0;
    width: 100%;
`;

export const PageList = styled(Page)`
    flex: 1 1 0;
`;

export const Main = styled.div`
    display: flex;
    flex-flow: column;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: hidden;
`;

export const PageListMain = styled.div``;
