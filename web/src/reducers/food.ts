import { makeDailyListReducer, DailyState } from '~client/reducers/list';
import { Food } from '~client/types/list';
import { Page } from '~client/types/app';

export type State = DailyState<Food>;
export default makeDailyListReducer<Food>(Page.food);
