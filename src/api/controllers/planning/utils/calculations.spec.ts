import {
  calculateMonthlyIncomeTax,
  calculateMonthlyNIContributions,
  calculateYearlyTaxRelief,
} from './calculations';

describe('planning utils (calculations)', () => {
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

  describe(calculateYearlyTaxRelief.name, () => {
    const basicRate = 0.2;
    const higherRate = 0.4;
    const additionalRate = 0.45;

    const basicAllowance = 3750000;
    const additionalThreshold = 15000000;

    it.each`
      taxpayer                    | taxableIncome | taxCode    | taxDeduction | expected
      ${'low income'}             | ${950004}     | ${'1250L'} | ${187740}    | ${0}
      ${'basic rate'}             | ${2700000}    | ${'1250L'} | ${360000}    | ${72000}
      ${'basic rate (maxed)'}     | ${2700000}    | ${'1250L'} | ${1450000}   | ${290000}
      ${'basic rate (over max)'}  | ${2700000}    | ${'1250L'} | ${1560000}   | ${290000}
      ${'higher rate'}            | ${8500000}    | ${'1257L'} | ${360000}    | ${144000}
      ${'higher rate (maxed)'}    | ${8500000}    | ${'1257L'} | ${3493000}   | ${1397200}
      ${'higher rate (over max)'} | ${8500000}    | ${'1257L'} | ${3600000}   | ${1418600}
      ${'additional rate'}        | ${15800000}   | ${'OT'}    | ${360000}    | ${162000}
      ${'non-standard allowance'} | ${8500000}    | ${'818L'}  | ${3600000}   | ${1440000}
    `(
      'should calculate tax relief for a $taxpayer tax payer',
      ({ taxableIncome, taxCode, taxDeduction, expected }) => {
        expect.assertions(1);
        const { basic, extra } = calculateYearlyTaxRelief(
          taxableIncome,
          taxCode,
          taxDeduction,
          basicAllowance,
          additionalThreshold,
          basicRate,
          higherRate,
          additionalRate,
        );
        expect(basic + extra).toBeCloseTo(expected);
      },
    );

    it.each`
      taxpayer                    | taxableIncome | taxCode    | taxDeduction | expected
      ${'low income'}             | ${950004}     | ${'1250L'} | ${187740}    | ${0}
      ${'basic rate'}             | ${2700000}    | ${'1250L'} | ${360000}    | ${72000}
      ${'basic rate (maxed)'}     | ${2700000}    | ${'1250L'} | ${1450000}   | ${290000}
      ${'basic rate (over max)'}  | ${2700000}    | ${'1250L'} | ${1560000}   | ${290000}
      ${'higher rate'}            | ${8500000}    | ${'1257L'} | ${360000}    | ${72000}
      ${'higher rate (maxed)'}    | ${8500000}    | ${'1257L'} | ${3493000}   | ${698600}
      ${'higher rate (over max)'} | ${8500000}    | ${'1257L'} | ${3600000}   | ${720000}
      ${'additional rate'}        | ${15800000}   | ${'OT'}    | ${360000}    | ${72000}
      ${'non-standard allowance'} | ${8500000}    | ${'818L'}  | ${3600000}   | ${720000}
    `(
      'should calculate basic (automatic) tax relief for a $taxpayer tax payer',
      ({ taxableIncome, taxCode, taxDeduction, expected }) => {
        expect.assertions(1);
        const { basic } = calculateYearlyTaxRelief(
          taxableIncome,
          taxCode,
          taxDeduction,
          basicAllowance,
          additionalThreshold,
          basicRate,
          higherRate,
          additionalRate,
        );
        expect(basic).toBeCloseTo(expected);
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
