import { makeDailyListReducer, DailyState } from '~client/reducers/list';
import { Page, Bill } from '~client/types';

export type State = DailyState<Bill>;
export default makeDailyListReducer<Bill, Page.bills>(Page.bills);
