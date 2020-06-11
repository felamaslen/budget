import { Fund } from './funds';
import { ListItem, CreateList, UpdateList, ListCalcItem } from './list';
import { ListCategory, ListCalcCategory, Page } from './shared';

interface MultiTaskBase {
  route: ListCategory;
  method: 'post' | 'put' | 'delete';
  query?: object;
  body: object;
}

interface MultiTaskCreate<I extends ListItem> extends MultiTaskBase {
  method: 'post';
  body: CreateList<I>;
}

interface MultiTaskUpdate<I extends ListItem> extends MultiTaskBase {
  method: 'put';
  body: UpdateList<I>;
}

interface MultiTaskDelete extends MultiTaskBase {
  method: 'delete';
  body: { id: string };
}

type MultiTaskGeneric<I extends ListItem> =
  | MultiTaskCreate<I>
  | MultiTaskUpdate<I>
  | MultiTaskDelete;

export type MultiTaskStandard<I extends ListCalcItem> = MultiTaskGeneric<I> & {
  route: ListCalcCategory;
};

export type MultiTaskFunds = MultiTaskGeneric<Fund> & {
  route: Page.funds;
};

export type MultiTask<I extends ListCalcItem = ListCalcItem> =
  | MultiTaskStandard<I>
  | MultiTaskFunds;
