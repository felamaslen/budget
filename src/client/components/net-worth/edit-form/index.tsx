import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import { useState, useCallback, useMemo, useEffect } from 'react';

import { Step } from './constants';
import { Props as ContainerProps } from './form-container';
import { StepOverview } from './overview';
import { StepCurrencies } from './step-currencies';
import { StepDate } from './step-date';
import { StepAssets, StepLiabilities } from './step-values';

import { CREATE_ID } from '~client/constants/data';
import { OnUpdate, OnCreate } from '~client/hooks';
import { sortByDate, withoutId } from '~client/modules/data';
import type { Id, NetWorthEntryNative as NetWorthEntry, SetActiveId } from '~client/types';
import type { NetWorthCategory, NetWorthSubcategory } from '~client/types/gql';
import type { Create } from '~shared/types';

type PropsItemForm = {
  add?: boolean;
  item: NetWorthEntry;
  categories: NetWorthCategory[];
  subcategories: NetWorthSubcategory[];
  setActiveId: SetActiveId;
  onDelete?: () => void;
  onEdit: (
    id: Id,
    item: Create<NetWorthEntry>,
    onComplete: React.EventHandler<React.MouseEvent | React.KeyboardEvent | React.TouchEvent>,
  ) => void;
};

type TempState = {
  item: Create<NetWorthEntry>;
  touched: boolean;
};

const NetWorthItemForm: React.FC<PropsItemForm> = ({
  add = false,
  item,
  categories,
  subcategories,
  setActiveId,
  onDelete,
  onEdit,
}) => {
  const [step, setStep] = useState<Step | null>(null);

  const [{ item: tempItem, touched }, setTemp] = useState<TempState>({
    item: withoutId<NetWorthEntry>(item),
    touched: false,
  });
  const setTempItem = useCallback(
    (action: React.SetStateAction<TempState['item']>) =>
      setTemp((last) => ({
        item: typeof action === 'function' ? action(last.item) : action,
        touched: true,
      })),
    [],
  );

  const onCancel = useCallback(() => {
    setTemp({ item: withoutId<NetWorthEntry>(item), touched: false });
  }, [item]);

  useEffect(() => {
    onCancel();
  }, [item, onCancel]);

  const onBack = useCallback(() => {
    if (touched) {
      onCancel();
    } else {
      setActiveId(null);
    }
  }, [setActiveId, touched, onCancel]);

  const onComplete = useCallback(() => {
    if (add) {
      setActiveId(null);
    }
  }, [add, setActiveId]);

  const onSave = useCallback(() => {
    setTemp((last) => ({ ...last, touched: false }));
    onEdit(item.id, tempItem, onComplete);
  }, [onEdit, item.id, tempItem, onComplete]);

  const onDone = useCallback(() => setStep(null), []);

  const containerProps: Omit<ContainerProps, 'step'> = {
    add,
    onDone,
    id: item.id,
    item,
  };

  const stepProps = {
    item: tempItem,
    categories,
    subcategories,
    onEdit: setTempItem,
  };

  if (step === Step.Date) {
    return <StepDate containerProps={containerProps} {...stepProps} />;
  }
  if (step === Step.Currencies) {
    return <StepCurrencies containerProps={containerProps} {...stepProps} />;
  }
  if (step === Step.Assets) {
    return <StepAssets containerProps={containerProps} {...stepProps} />;
  }
  if (step === Step.Liabilities) {
    return <StepLiabilities containerProps={containerProps} {...stepProps} />;
  }

  return (
    <StepOverview
      add={add}
      categories={categories}
      subcategories={subcategories}
      item={tempItem}
      touched={touched}
      onBack={onBack}
      onDelete={onDelete}
      onSave={onSave}
      setStep={setStep}
    />
  );
};

type PropsBase = Omit<PropsItemForm, 'add' | 'onEdit'>;

export type PropsEdit = PropsBase & {
  onUpdate: OnUpdate<Create<NetWorthEntry>>;
};

export const NetWorthEditForm: React.FC<PropsEdit> = ({ onUpdate, ...props }) => {
  const onEdit = useCallback(
    (id: Id, tempItem: Create<NetWorthEntry>, onComplete) => {
      onUpdate(id, tempItem);
      onComplete();
    },
    [onUpdate],
  );

  return <NetWorthItemForm {...props} onEdit={onEdit} />;
};

export type PropsAdd = Omit<PropsBase, 'id' | 'item'> & {
  data: NetWorthEntry[];
  onCreate: OnCreate<Create<NetWorthEntry>>;
};

export const NetWorthAddForm: React.FC<PropsAdd> = ({ data, onCreate, ...props }) => {
  const item = useMemo<NetWorthEntry>(() => {
    if (data.length) {
      const itemsSorted = sortByDate(data);
      const lastItem: NetWorthEntry = itemsSorted[itemsSorted.length - 1];

      return {
        ...lastItem,
        date: endOfMonth(addMonths(lastItem.date, 1)),
        id: CREATE_ID,
      };
    }

    return {
      id: CREATE_ID,
      date: new Date(),
      creditLimit: [],
      currencies: [],
      values: [],
    };
  }, [data]);

  const onEdit = useCallback(
    (_: Id, tempItem: Create<NetWorthEntry>, onComplete) => {
      onCreate(tempItem);
      onComplete();
    },
    [onCreate],
  );

  return <NetWorthItemForm {...props} add item={item} onEdit={onEdit} />;
};
