import React from 'react';

import * as Styled from './styles';
import type { LoanOverride, LoanOverrides, LoanWithInfo } from './types';
import { FormFieldCost, FormFieldRange, FormFieldTickbox } from '~client/components/form-field';
import { forecastTotalLoanPayable } from '~client/modules/finance';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { Flex } from '~client/styled/shared';

export type Props = {
  loans: LoanWithInfo[];
  overrides: LoanOverrides;
  setOverrides: React.Dispatch<React.SetStateAction<LoanOverrides>>;
  setVisible: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
};

type PropsItem = {
  override?: LoanOverride;
} & Pick<Props, 'setOverrides' | 'setVisible'> &
  LoanWithInfo;

const LoansSidebarItem: React.FC<PropsItem> = ({
  line,
  loanValue,
  modifiedLoan,
  originalLoan,
  override,
  setOverrides,
  visible,
  setVisible,
}) => {
  const totalPayableModified =
    forecastTotalLoanPayable(
      modifiedLoan.principal,
      modifiedLoan.monthlyPayment,
      modifiedLoan.interestRate / 100,
    ) + (override?.lumpSum ?? 0);
  const totalPayableOriginal = forecastTotalLoanPayable(
    originalLoan.principal,
    originalLoan.monthlyPayment,
    originalLoan.interestRate / 100,
  );

  return (
    <Styled.LoansSidebarItem>
      <Flex>
        <FormFieldTickbox
          value={visible}
          onChange={(): void =>
            setVisible((last) => ({ ...last, [line.key]: last[line.key] === false }))
          }
        />
        <Styled.LoansSidebarTitle color={line.color as string}>
          {line.name}
        </Styled.LoansSidebarTitle>
      </Flex>
      <Styled.LoanInfo>
        <Styled.LoanInfoGrid>
          <Styled.LoanInfoLabel>Regular overpayment</Styled.LoanInfoLabel>
          <Styled.LoanInfoInput>
            <FormFieldRange
              value={override?.overpayment ?? 0}
              min={0}
              max={1}
              step={0.01}
              onChange={(value): void =>
                setOverrides((last) => ({
                  ...last,
                  [line.key]: {
                    ...(last[line.key] ?? { lumpSum: 0 }),
                    overpayment: value,
                  },
                }))
              }
            />
          </Styled.LoanInfoInput>
          <Styled.LoanInfoValues>
            {formatPercent(override?.overpayment ?? 0, { precision: 0 })}
          </Styled.LoanInfoValues>
          <Styled.LoanInfoLabel>Lump sum payment</Styled.LoanInfoLabel>
          <Styled.LoanInfoInput>
            <FormFieldCost
              value={override?.lumpSum ?? 0}
              min={0}
              max={originalLoan.principal}
              step={100}
              onChange={(value): void =>
                setOverrides((last) => ({
                  ...last,
                  [line.key]: {
                    ...(last[line.key] ?? { overpayment: 0 }),
                    lumpSum: Math.min(originalLoan.principal, value),
                  },
                }))
              }
            />
          </Styled.LoanInfoInput>
        </Styled.LoanInfoGrid>
        <table>
          <tbody>
            <tr>
              <td>Principal:</td>
              <td>{formatCurrency(modifiedLoan.principal)}</td>
            </tr>
            <tr>
              <td>Interest rate:</td>
              <td>{formatPercent(loanValue.rate / 100)}</td>
            </tr>
            <tr>
              <td>Term (months):</td>
              <td>{loanValue.paymentsRemaining}</td>
            </tr>
            <tr>
              <td>New monthly payment:</td>
              <td>
                <b>{formatCurrency(modifiedLoan.monthlyPayment)}</b>
              </td>
            </tr>
            <tr>
              <td>Total payable:</td>
              <td>{formatCurrency(totalPayableModified)}</td>
            </tr>
            <tr>
              <td>Total payable (original):</td>
              <td>{formatCurrency(totalPayableOriginal)}</td>
            </tr>
            <tr>
              <td>Saving:</td>
              <td>
                <b>{formatCurrency(totalPayableOriginal - totalPayableModified)}</b>
              </td>
            </tr>
          </tbody>
        </table>
      </Styled.LoanInfo>
    </Styled.LoansSidebarItem>
  );
};

export const LoansSidebar: React.FC<Props> = ({ loans, overrides, setOverrides, setVisible }) => (
  <Styled.LoansSidebar>
    {loans.map((loan) => (
      <LoansSidebarItem
        key={loan.line.key}
        {...loan}
        override={overrides[loan.line.key]}
        setOverrides={setOverrides}
        setVisible={setVisible}
      />
    ))}
  </Styled.LoansSidebar>
);
