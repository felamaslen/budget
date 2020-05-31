import { makeDailyListReducer, DailyState } from '~client/reducers/list';
import { Page, Holiday } from '~client/types';

export type State = DailyState<Holiday>;
export default makeDailyListReducer<Holiday, Page.holiday>(Page.holiday);
