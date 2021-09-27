import type { ModalFieldProps, PropsFormFieldPart } from '../metadata/types';

import type { IncomeDeduction } from '~client/types/gql';
import type { GQL } from '~shared/types';

export type IncomeDeductionNative = GQL<IncomeDeduction>;

export type PropsFormFieldIncomeDeduction = PropsFormFieldPart<IncomeDeductionNative>;

export type PropsFormFieldModalIncomeDeductions = ModalFieldProps<IncomeDeductionNative>;
