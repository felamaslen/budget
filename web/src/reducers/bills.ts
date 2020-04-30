import { makeDailyListReducer, DailyState } from '~client/reducers/list';
import { Bill } from '~client/types/list';
import { Page } from '~client/types/app';

export type State = DailyState<Bill>;
export default makeDailyListReducer<Bill>(Page.bills);
