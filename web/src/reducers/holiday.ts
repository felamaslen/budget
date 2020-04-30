import { makeDailyListReducer, DailyState } from '~client/reducers/list';
import { Holiday } from '~client/types/list';
import { Page } from '~client/types/app';

export type State = DailyState<Holiday>;
export default makeDailyListReducer<Holiday>(Page.holiday);
