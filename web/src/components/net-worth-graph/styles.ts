import styled from 'styled-components';

export const FTILabel = styled.h3`
    display: flex;
    align-items: center;
`;

export const FTIEquals = styled.span`
    margin: 0 0.75rem;
`;

export const FTIFormula = styled.div`
    display: flex;
    align-items: center;
    font-family: serif;
`;

export const FTIFraction = styled.span`
    display: flex;
    flex-flow: column;
    align-items: center;
`;

export const FTIFormulaNumerator = styled.span`
    border-bottom: 1px solid black;
`;

export const FTIFormulaDenominator = styled.span``;

export const GraphKey = styled.div`
    h4,
    ul {
        margin: 0;
        padding: 0;
    }
`;

export const colors = {
    assets: 'darkgreen',
    liabilities: 'darkred',
    expenses: 'blueviolet',
};

const Key = styled.li`
    font-weight: bold;
    list-style: none;
`;

export const KeyAssets = styled(Key)`
    color: ${colors.assets};
`;
export const KeyLiabilities = styled(Key)`
    color: ${colors.liabilities};
`;
export const KeyExpenses = styled(Key)`
    color: ${colors.expenses};
`;
