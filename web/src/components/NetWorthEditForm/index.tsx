import React, { useState, useCallback, useMemo } from 'react';
import shortid from 'shortid';
import endOfMonth from 'date-fns/endOfMonth';
import addMonths from 'date-fns/addMonths';

import { CreateEdit, Create } from '~client/types/crud';
import {
  Entry,
  Category,
  Subcategory,
  CreditLimit,
  ValueObject,
  Currency,
} from '~client/types/net-worth';
import { SetActiveId, OnUpdate, OnCreate } from '~client/hooks/crud';
import { sortByDate } from '~client/modules/data';
import StepDate from '~client/components/NetWorthEditForm/step-date';
import StepCurrencies from '~client/components/NetWorthEditForm/step-currencies';
import { StepAssets, StepLiabilities } from '~client/components/NetWorthEditForm/step-values';
import { Props as ContainerProps } from './form-container';

import { Step, steps } from './constants';

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
    event => {
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

const withContrivedRowIds = <V extends object>(row: V[]): V[] =>
  row.map(item => ({ ...item, id: shortid.generate() }));

const withContrivedIds = ({ id, ...item }: Entry): Create<Entry> => ({
  ...item,
  values: withContrivedRowIds<ValueObject>(item.values),
  currencies: withContrivedRowIds<Currency>(item.currencies),
  creditLimit: withContrivedRowIds<CreditLimit>(item.creditLimit),
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
  const item = useMemo<Omit<Entry, 'id'>>(() => {
    if (data.length) {
      const itemsSorted: Entry[] = sortByDate<Entry>(data);

      const lastItem = itemsSorted[itemsSorted.length - 1];

      return {
        ...withContrivedIds(lastItem),
        date: endOfMonth(addMonths(lastItem.date, 1)),
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
