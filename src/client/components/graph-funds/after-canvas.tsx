import React, { Dispatch, SetStateAction, useCallback, useMemo } from 'react';

import * as Styled from './styles';
import { FormFieldRange, FormFieldSelect, SelectOptions } from '~client/components/form-field';
import { GRAPH_FUNDS_OVERALL_ID, Mode } from '~client/constants/graph';
import { useCTA, useDebouncedState, useUpdateEffect } from '~client/hooks';
import { abbreviateFundName } from '~client/modules/finance';
import type { Id, FundItem, HistoryOptions } from '~client/types';
import { FundPeriod } from '~client/types/gql';

export type ToggleList = Record<string, boolean | null>;

export type Props = Pick<ItemProps, 'toggleList' | 'setToggleList'> & {
  historyOptions: HistoryOptions;
  modeList: Mode[];
  mode: Mode;
  changeMode: Dispatch<SetStateAction<Mode>>;
  fundItems: FundItem[];
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  changePeriod: (query: HistoryOptions) => void;
};

type ItemProps = {
  numItems: number;
  toggleList: ToggleList;
  setToggleList: Dispatch<SetStateAction<ToggleList>>;
  id: Id;
  color: string;
  item: string;
  abbreviate?: boolean;
};

const Item: React.FC<ItemProps> = ({
  numItems,
  toggleList,
  setToggleList,
  id,
  color,
  item,
  abbreviate = true,
}) => {
  const onToggle = useCallback(() => {
    setToggleList(
      (last: ToggleList): ToggleList => {
        const next = { ...last, [id]: last[id] === false };
        if (Object.keys(next).length === numItems && Object.values(next).every((value) => !value)) {
          return last;
        }

        return next;
      },
    );
  }, [id, setToggleList, numItems]);

  const events = useCTA(onToggle, { stopPropagation: true });

  return (
    <li {...events}>
      <Styled.SidebarCheckbox
        style={{
          borderColor: color,
        }}
        checked={toggleList[id] !== false}
      />
      <Styled.SidebarFund title={abbreviate ? item : undefined}>
        {abbreviate ? abbreviateFundName(item) : item}
      </Styled.SidebarFund>
    </li>
  );
};

const periodSelectOptions: SelectOptions<FundPeriod> = [
  { internal: FundPeriod.Year, external: 'Year' },
  { internal: FundPeriod.Month, external: 'Month' },
];

type TempQueryState = {
  lengths: Record<FundPeriod, number>;
  denominator: FundPeriod;
};

export const AfterCanvas: React.FC<Props> = ({
  historyOptions,
  modeList,
  mode,
  changeMode,
  fundItems,
  toggleList,
  setToggleList,
  sidebarOpen,
  setSidebarOpen,
  changePeriod,
}) => {
  const modeSelectOptions = useMemo<SelectOptions<Mode>>(
    () => modeList.map((internal) => ({ internal })),
    [modeList],
  );

  const [tempQuery, debouncedQuery, setTempQuery] = useDebouncedState<TempQueryState>(
    {
      lengths: {
        [FundPeriod.Year]: 1,
        [FundPeriod.Month]: 6,
        [historyOptions.period]: historyOptions.length,
      },
      denominator: historyOptions.period,
    },
    100,
  );

  const changePeriodDenominator = useCallback(
    (denominator: FundPeriod) => setTempQuery((last) => ({ ...last, denominator })),
    [setTempQuery],
  );

  const changePeriodLength = useCallback(
    (length: number) =>
      setTempQuery((last) => ({
        ...last,
        lengths: { ...last.lengths, [last.denominator]: length },
      })),
    [setTempQuery],
  );

  useUpdateEffect(() => {
    changePeriod({
      period: debouncedQuery.denominator,
      length: debouncedQuery.lengths[debouncedQuery.denominator],
    });
  }, [debouncedQuery, changePeriod]);

  const maxLength = tempQuery.denominator === FundPeriod.Year ? 10 : 18;

  return (
    <>
      <Styled.FundModeSwitch>
        <Styled.PeriodLengthIndicator>
          {tempQuery.lengths[tempQuery.denominator]}
        </Styled.PeriodLengthIndicator>
        <FormFieldSelect
          options={periodSelectOptions}
          value={tempQuery.denominator}
          onChange={changePeriodDenominator}
        />
        <FormFieldRange
          value={tempQuery.lengths[tempQuery.denominator]}
          onChange={changePeriodLength}
          min={0}
          max={maxLength}
          step={1}
        />
        <FormFieldSelect options={modeSelectOptions} value={mode} onChange={changeMode} />
      </Styled.FundModeSwitch>
      <Styled.FundSidebar
        tabIndex={-1}
        isOpen={sidebarOpen}
        onClick={(): void => setSidebarOpen((last) => !last)}
      >
        {fundItems &&
          fundItems.map((item: FundItem) => (
            <Item
              key={item.id}
              numItems={fundItems.length}
              {...item}
              abbreviate={item.id !== GRAPH_FUNDS_OVERALL_ID}
              toggleList={toggleList}
              setToggleList={setToggleList}
            />
          ))}
      </Styled.FundSidebar>
    </>
  );
};
