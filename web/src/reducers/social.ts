import { makeDailyListReducer, DailyState } from '~client/reducers/list';
import { Social } from '~client/types/list';
import { Page } from '~client/types/app';

export type State = DailyState<Social>;
export default makeDailyListReducer<Social>(Page.social);
