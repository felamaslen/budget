import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import React, { useState, useCallback, useMemo } from 'react';

import { Step, steps } from './constants';
import { Props as ContainerProps } from './form-container';
import { StepCurrencies } from './step-currencies';
import { StepDate } from './step-date';
import { StepAssets, StepLiabilities } from './step-values';

import { CREATE_ID } from '~client/constants/data';
import { OnUpdate, OnCreate } from '~client/hooks';
import { sortByDate, withoutId } from '~client/modules/data';
import {
  Create,
  Id,
  NetWorthCategory,
  NetWorthSubcategory,
  NetWorthEntryNative as NetWorthEntry,
  SetActiveId,
} from '~client/types';

type PropsItemForm = {
  add?: boolean;
  item: NetWorthEntry;
  categories: NetWorthCategory[];
  subcategories: NetWorthSubcategory[];
  setActiveId: SetActiveId;
  onEdit: (
    id: Id,
    item: Create<NetWorthEntry>,
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

  const [tempItem, setTempItem] = useState<Create<NetWorthEntry>>(withoutId<NetWorthEntry>(item));
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
      onEdit(item.id, tempItem, onComplete);
    }
  }, [onComplete, step, item.id, tempItem, onEdit]);

  const onFirstStep = steps.indexOf(step) === 0;
  const onLastStep = steps.indexOf(step) === steps.length - 1;

  const containerProps: Omit<ContainerProps, 'step'> = {
    add,
    onComplete,
    id: item.id,
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
