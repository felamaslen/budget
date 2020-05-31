import { makeDailyListReducer, DailyState } from '~client/reducers/list';
import { Page, Social } from '~client/types';

export type State = DailyState<Social>;
export default makeDailyListReducer<Social, Page.social>(Page.social);
