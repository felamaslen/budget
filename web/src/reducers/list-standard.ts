import { makeDailyListReducer, DailyState } from '~client/reducers/list';
import {
  ListItemExtended,
  ListItemExtendedNative,
  ListItemStandardNative,
  PageListExtended,
  PageListStandard,
} from '~client/types';

type StateStandard = DailyState<ListItemStandardNative>;
type StateExtended = DailyState<ListItemExtendedNative>;

export { StateStandard as Income };
export { StateStandard as Bills };

export { StateExtended as Food };
export { StateExtended as General };
export { StateExtended as Holiday };
export { StateExtended as Social };

export const income = makeDailyListReducer(PageListStandard.Income);
export const bills = makeDailyListReducer(PageListStandard.Bills);

export const food = makeDailyListReducer<ListItemExtended, PageListExtended.Food>(
  PageListExtended.Food,
);
export const general = makeDailyListReducer<ListItemExtended, PageListExtended.General>(
  PageListExtended.General,
);
export const holiday = makeDailyListReducer<ListItemExtended, PageListExtended.Holiday>(
  PageListExtended.Holiday,
);
export const social = makeDailyListReducer<ListItemExtended, PageListExtended.Social>(
  PageListExtended.Social,
);
