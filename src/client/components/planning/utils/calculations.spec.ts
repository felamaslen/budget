import {
  calculateMonthlyIncomeTax,
  calculateMonthlyNIContributions,
  calculateMonthlyTaxRelief,
  getFinancialYear,
} from './calculations';

describe('Planning utils (calculations)', () => {
  describe(getFinancialYear.name, () => {
    describe('when the date is before the end of the financial year', () => {
      it('should return the previous year', () => {
        expect.assertions(3);
        expect(getFinancialYear(new Date('2021-01-01'))).toBe(2020);
        expect(getFinancialYear(new Date('2021-03-20'))).toBe(2020);
        expect(getFinancialYear(new Date('2021-03-31'))).toBe(2020);
      });
    });

    describe('when the date is after the end of the financial year', () => {
      it('should return the current year', () => {
        expect.assertions(3);
        expect(getFinancialYear(new Date('2021-04-01'))).toBe(2021);
        expect(getFinancialYear(new Date('2021-04-19'))).toBe(2021);
        expect(getFinancialYear(new Date('2021-12-31'))).toBe(2021);
      });
    });
  });

  describe(calculateMonthlyIncomeTax.name, () => {
    const basicRate = 0.2;
    const higherRate = 0.4;
    const additionalRate = 0.45;

    const basicAllowance = 3750000;
    const additionalThreshold = 15000000;

    it.each`
      taxpayer                    | taxableIncome | taxCode    | expected
      ${'low income'}             | ${79167}      | ${'1250L'} | ${0}
      ${'basic rate'}             | ${225000}     | ${'1250L'} | ${24167}
      ${'higher rate'}            | ${708333}     | ${'1257L'} | ${178933}
      ${'additional rate'}        | ${1316667}    | ${'OT'}    | ${467500}
      ${'non-standard allowance'} | ${708333}     | ${'818L'}  | ${193566}
    `('should calculate tax for a $taxpayer tax payer', ({ taxableIncome, taxCode, expected }) => {
      expect.assertions(1);
      expect(
        calculateMonthlyIncomeTax(
          taxableIncome,
          taxCode,
          basicAllowance,
          additionalThreshold,
          basicRate,
          higherRate,
          additionalRate,
        ),
      ).toBeCloseTo(expected);
    });
  });

  describe(calculateMonthlyTaxRelief.name, () => {
    const basicRate = 0.2;
    const higherRate = 0.4;
    const additionalRate = 0.45;

    const basicAllowance = 3750000;
    const additionalThreshold = 15000000;

    it.each`
      taxpayer                    | taxableIncome | taxCode    | taxDeduction | expected
      ${'low income'}             | ${79167}      | ${'1250L'} | ${15645}     | ${0}
      ${'basic rate'}             | ${225000}     | ${'1250L'} | ${30000}     | ${6000}
      ${'basic rate (maxed)'}     | ${225000}     | ${'1250L'} | ${120833}    | ${24167}
      ${'basic rate (over max)'}  | ${225000}     | ${'1250L'} | ${130000}    | ${24167}
      ${'higher rate'}            | ${708333}     | ${'1257L'} | ${30000}     | ${12000}
      ${'higher rate (maxed)'}    | ${708333}     | ${'1257L'} | ${291083}    | ${116433}
      ${'higher rate (over max)'} | ${708333}     | ${'1257L'} | ${300000}    | ${118217}
      ${'additional rate'}        | ${1316667}    | ${'OT'}    | ${30000}     | ${13500}
      ${'non-standard allowance'} | ${708333}     | ${'818L'}  | ${300000}    | ${120000}
    `(
      'should calculate tax relief for a $taxpayer tax payer',
      ({ taxableIncome, taxCode, taxDeduction, expected }) => {
        expect.assertions(1);
        expect(
          calculateMonthlyTaxRelief(
            taxableIncome,
            taxCode,
            taxDeduction,
            basicAllowance,
            additionalThreshold,
            basicRate,
            higherRate,
            additionalRate,
          ),
        ).toBeCloseTo(expected);
      },
    );
  });

  describe(calculateMonthlyNIContributions.name, () => {
    const paymentThreshold = 79700;
    const upperEarningsLimit = 418900;
    const lowerRate = 0.12;
    const higherRate = 0.02;

    it.each`
      taxpayer         | taxableIncome | expected
      ${'basic rate'}  | ${225000}     | ${17436}
      ${'higher rate'} | ${708333}     | ${46493}
    `(
      'should calculate NI contributions for a $taxpayer tax payer',
      ({ taxableIncome, expected }) => {
        expect.assertions(1);
        expect(
          calculateMonthlyNIContributions(
            taxableIncome,
            paymentThreshold,
            upperEarningsLimit,
            lowerRate,
            higherRate,
          ),
        ).toBeCloseTo(expected);
      },
    );
  });
});
