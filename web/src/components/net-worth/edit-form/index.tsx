import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import React, { useState, useCallback, useMemo } from 'react';

import { Step, steps } from './constants';
import { Props as ContainerProps } from './form-container';
import { StepCurrencies } from './step-currencies';
import { StepDate } from './step-date';
import { StepAssets, StepLiabilities } from './step-values';
import { SetActiveId, OnUpdate, OnCreate } from '~client/hooks';
import { sortByDate, generateFakeId } from '~client/modules/data';
import {
  CreateEdit,
  Create,
  Category,
  Subcategory,
  Entry,
  ValueObject,
  Currency,
  Item,
} from '~client/types';

type PropsItemForm = {
  add?: boolean;
  item: CreateEdit<Entry>;
  categories: Category[];
  subcategories: Subcategory[];
  setActiveId: SetActiveId;
  onEdit: (
    item: CreateEdit<Entry>,
    onComplete: React.EventHandler<React.MouseEvent | React.KeyboardEvent | React.TouchEvent>,
  ) => void;
};

const NetWorthItemForm: React.FC<PropsItemForm> = ({
  add = false,
  item,
  categories,
  subcategories,
  setActiveId,
  onEdit,
}) => {
  const onComplete = useCallback(
    (event) => {
      if (event) {
        event.stopPropagation();
      }
      setActiveId(null);
    },
    [setActiveId],
  );

  const [tempItem, setTempItem] = useState<CreateEdit<Entry>>(item);
  const [step, setStep] = useState<Step>(steps[0]);

  const onPrevStep = useCallback(() => {
    const stepIndex = steps.indexOf(step);
    if (stepIndex > 0) {
      setStep(steps[stepIndex - 1]);
    }
  }, [step]);

  const onNextStep = useCallback(() => {
    const stepIndex = steps.indexOf(step);
    if (stepIndex < steps.length - 1) {
      setStep(steps[stepIndex + 1]);
    } else {
      onEdit(tempItem, onComplete);
    }
  }, [onComplete, step, tempItem, onEdit]);

  const onFirstStep = steps.indexOf(step) === 0;
  const onLastStep = steps.indexOf(step) === steps.length - 1;

  const containerProps: ContainerProps = {
    add,
    onComplete,
    item,
    onPrevStep,
    onNextStep,
    onFirstStep,
    onLastStep,
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

  throw new Error('Invalid step set for <NetWorthEditForm />');
};

const withContrivedRowIds = <V extends Item>(row: Create<V>[]): V[] =>
  row.map<V>((item) => ({ ...item, id: generateFakeId() } as V));

const withContrivedIds = ({ id, ...item }: Entry): Create<Entry> => ({
  ...item,
  values: withContrivedRowIds<ValueObject>(item.values),
  currencies: withContrivedRowIds<Currency>(item.currencies),
});

type PropsBase = Omit<PropsItemForm, 'add' | 'onEdit'>;

export type PropsEdit = PropsBase & {
  onUpdate: OnUpdate<Entry>;
};

export const NetWorthEditForm: React.FC<PropsEdit> = ({ onUpdate, ...props }) => {
  const onEdit = useCallback(
    (tempItem, onComplete) => {
      onUpdate(tempItem.id, tempItem);
      onComplete();
    },
    [onUpdate],
  );

  return <NetWorthItemForm {...props} onEdit={onEdit} />;
};

export type PropsAdd = Omit<PropsBase, 'item'> & {
  data: Entry[];
  onCreate: OnCreate<Entry>;
};

export const NetWorthAddForm: React.FC<PropsAdd> = ({ data, onCreate, ...props }) => {
  const item = useMemo<Create<Entry>>(() => {
    if (data.length) {
      const itemsSorted = sortByDate(data);
      const lastItemWithIds: Create<Entry> = withContrivedIds(itemsSorted[itemsSorted.length - 1]);

      return {
        ...lastItemWithIds,
        date: endOfMonth(addMonths(lastItemWithIds.date, 1)),
      };
    }

    return {
      date: new Date(),
      creditLimit: [],
      currencies: [],
      values: [],
    };
  }, [data]);

  const onEdit = useCallback(
    (tempItem, onComplete) => {
      onCreate(tempItem);
      onComplete();
    },
    [onCreate],
  );

  return <NetWorthItemForm {...props} add item={item} onEdit={onEdit} />;
};
