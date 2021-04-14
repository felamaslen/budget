import { makeDailyListReducer } from '~client/reducers/list';
import { PageListStandard } from '~client/types/enum';

export const income = makeDailyListReducer(PageListStandard.Income);
export const bills = makeDailyListReducer(PageListStandard.Bills);
export const food = makeDailyListReducer(PageListStandard.Food);
export const general = makeDailyListReducer(PageListStandard.General);
export const holiday = makeDailyListReducer(PageListStandard.Holiday);
export const social = makeDailyListReducer(PageListStandard.Social);
