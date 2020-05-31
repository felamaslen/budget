import { makeDailyListReducer, DailyState } from '~client/reducers/list';
import { Page, Food } from '~client/types';

export type State = DailyState<Food>;
export default makeDailyListReducer<Food, Page.food>(Page.food);
