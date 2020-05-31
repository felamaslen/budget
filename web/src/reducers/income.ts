import { makeDailyListReducer, DailyState } from '~client/reducers/list';
import { Page, Income } from '~client/types';

export type State = DailyState<Income>;
export default makeDailyListReducer<Income, Page.income>(Page.income);
