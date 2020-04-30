import { makeDailyListReducer, DailyState } from '~client/reducers/list';
import { General } from '~client/types/list';
import { Page } from '~client/types/app';

export type State = DailyState<General>;
export default makeDailyListReducer<General>(Page.general);
