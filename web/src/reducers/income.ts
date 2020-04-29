import { makeDailyListReducer, DailyState } from '~client/reducers/list';
import { Income } from '~client/types/list';
import { Page } from '~client/types/app';

export type State = DailyState<Income>;
export default makeDailyListReducer<Income>(Page.income);
