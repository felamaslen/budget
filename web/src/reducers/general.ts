import { makeDailyListReducer, DailyState } from '~client/reducers/list';
import { Page, General } from '~client/types';

export type State = DailyState<General>;
export default makeDailyListReducer<General, Page.general>(Page.general);
