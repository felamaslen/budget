import React, { useCallback, useMemo } from 'react';

import * as Styled from './styles';
import { FormFieldSelect, SelectOptions } from '~client/components/form-field';
import { fundPeriods, GRAPH_FUNDS_OVERALL_ID, Mode } from '~client/constants/graph';
import { useCTA } from '~client/hooks';
import { abbreviateFundName } from '~client/modules/finance';
import type { Id, FundItem, HistoryOptions } from '~client/types';

type ToggleList = {
  [id: string]: boolean | null;
};

type SetToggleList = (getNextToggleList: (prevToggleList: ToggleList) => ToggleList) => void;

type ItemProps = {
  numItems: number;
  toggleList: ToggleList;
  setToggleList: SetToggleList;
  id: Id;
  color: string;
  item: string;
  abbreviate?: boolean;
};

export type Props = {
  isMobile: boolean;
  historyOptions: HistoryOptions;
  modeList: Mode[];
  mode: Mode;
  changeMode: (nextMode: Mode) => void;
  fundItems: FundItem[];
  toggleList: ToggleList;
  setToggleList: SetToggleList;
  changePeriod: (query: HistoryOptions) => void;
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

  const events = useCTA(onToggle);

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

const periodSelectOptions: SelectOptions<HistoryOptions> = Object.values(fundPeriods).map(
  ({ name, query }) => ({
    internal: query,
    external: name,
  }),
);

export const AfterCanvas: React.FC<Props> = ({
  isMobile,
  historyOptions,
  modeList,
  mode,
  changeMode,
  fundItems,
  toggleList,
  setToggleList,
  changePeriod,
}) => {
  const modeSelectOptions = useMemo<SelectOptions<Mode>>(
    () => modeList.map((internal) => ({ internal })),
    [modeList],
  );

  if (isMobile) {
    return null;
  }

  return (
    <>
      <Styled.FundModeSwitch>
        <FormFieldSelect
          options={periodSelectOptions}
          value={historyOptions}
          onChange={changePeriod}
        />
        <FormFieldSelect options={modeSelectOptions} value={mode} onChange={changeMode} />
      </Styled.FundModeSwitch>
      <Styled.FundSidebar tabIndex={-1}>
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
