import React, { useState, useRef, useEffect, useCallback } from 'react';
import memoize from 'fast-memoize';
import { compose } from '@typed/compose';

import { PageList } from '~client/types/app';
import { Edit } from '~client/types/crud';
import {
  Column,
  getColumns,
  Income,
  Bill,
  Food,
  General,
  Holiday,
  Social,
} from '~client/types/list';
import { Row as Fund } from '~client/types/funds';
import { Button } from '~client/styled/shared/button';
import { ListRowDesktopBase } from '~client/components/ListRowDesktop';
import { IDENTITY, fieldExists } from '~client/modules/data';
import { CREATE_ID } from '~client/constants/data';
import { Button as NavButton, Command } from '~client/hooks/nav';

import * as Styled from './styles';

type Item = Partial<Fund & Income & Bill & Food & General & Holiday & Social>;

function withInitialValue<C extends Column<Item> = Column<Item>>(
  column: Column<Item>,
  initialValue: () => Item[C],
): (page: PageList) => (values: Edit<Item>) => Edit<Item> {
  return (page: PageList): ((values: Edit<Item>) => Edit<Item>) => {
    if (!getColumns<Edit<Item>>(page).includes(column)) {
      return IDENTITY;
    }

    return (values: Edit<Item>): Edit<Item> => ({ ...values, [column]: initialValue() });
  };
}

const withDate = withInitialValue<'date'>('date', () => new Date());
const withTransactions = withInitialValue<'transactions'>('transactions', () => []);

const initialValues = memoize(
  (page: PageList): Edit<Item> =>
    compose(
      withTransactions(page),
      withDate(page),
    )(
      getColumns<Edit<Item>>(page).reduce(
        (last: Edit<Item>, col: Column<Item>): Edit<Item> => ({
          ...last,
          [col]: undefined,
        }),
        { id: CREATE_ID } as Edit<Item>,
      ),
    ),
);

type Props = {
  page: PageList;
  activeColumn?: keyof Item | NavButton.Add;
  command: Command<Item>;
  setCommand: () => void;
  setActive: (id: string, column: Column<Item> | null) => void;
  onCreate: (page: PageList, values: Item) => void;
};

const ListCreateDesktop: React.FC<Props> = ({
  page,
  activeColumn,
  command,
  setCommand,
  setActive,
  onCreate,
}) => {
  const addBtn = useRef<HTMLButtonElement>(null);
  const addBtnFocus = activeColumn === NavButton.Add;
  const [wasFocused, setWasFocused] = useState<boolean>(false);

  useEffect(() => {
    if (addBtnFocus && !wasFocused) {
      setWasFocused(true);
      if (addBtn.current?.focus) {
        addBtn.current.focus();
      }
    } else if (!addBtnFocus && wasFocused) {
      setWasFocused(false);
      if (addBtn.current && addBtn.current.blur) {
        addBtn.current.blur();
      }
    }
  }, [addBtnFocus, wasFocused]);

  const [values, setValues] = useState<Edit<Item>>(initialValues(page));

  const onUpdate = useCallback(
    (column, value) => setValues(last => ({ ...last, [column]: value })),
    [],
  );

  const onAddPre = useCallback(() => {
    setActive(CREATE_ID, null);
  }, [setActive]);

  const onAdd = useCallback(() => {
    setActive(CREATE_ID, null);
    if (!Object.keys(values).every(key => fieldExists(Reflect.get(values, key)))) {
      return;
    }

    onCreate(page, values);
    setValues(initialValues(page));
    setActive(CREATE_ID, 'date');
  }, [onCreate, setActive, page, values]);

  return (
    <Styled.RowCreate>
      <ListRowDesktopBase
        item={values}
        page={page}
        activeColumn={activeColumn}
        setActive={setActive}
        command={command}
        setCommand={setCommand}
        onUpdate={onUpdate}
      />
      <Styled.AddButtonOuter>
        <Button ref={addBtn} aria-label="add-button" onMouseDown={onAddPre} onClick={onAdd}>
          {'Add'}
        </Button>
      </Styled.AddButtonOuter>
    </Styled.RowCreate>
  );
};

export default ListCreateDesktop;
