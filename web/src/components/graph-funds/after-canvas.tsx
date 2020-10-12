import React, { useCallback } from 'react';

import * as Styled from './styles';
import { Mode, Period, GRAPH_FUNDS_PERIODS, GRAPH_FUNDS_OVERALL_ID } from '~client/constants/graph';
import { useCTA } from '~client/hooks';
import { abbreviateFundName } from '~client/modules/finance';
import { Id, FundItem } from '~client/types';

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
  period: Period;
  modeList: Mode[];
  mode: Mode;
  changeMode: (nextMode: Mode) => void;
  fundItems: FundItem[];
  toggleList: ToggleList;
  setToggleList: SetToggleList;
  changePeriod: (nextPeriod: Period) => void;
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

export const AfterCanvas: React.FC<Props> = ({
  isMobile,
  period,
  modeList,
  mode,
  changeMode,
  fundItems,
  toggleList,
  setToggleList,
  changePeriod,
}) => {
  const onChangePeriod = useCallback(({ target: { value } }) => changePeriod(value), [
    changePeriod,
  ]);
  const onChangeMode = useCallback(({ target: { value } }) => changeMode(value), [changeMode]);

  return (
    <>
      {!isMobile && (
        <Styled.FundSidebar tabIndex={-1}>
          <li>
            {/* eslint-disable-next-line jsx-a11y/no-onchange */}
            <select defaultValue={period} onChange={onChangePeriod}>
              {GRAPH_FUNDS_PERIODS.map(([key, display]: [string, Period]) => (
                <option key={key} value={display}>
                  {display}
                </option>
              ))}
            </select>
          </li>
          <li>
            {/* eslint-disable-next-line jsx-a11y/no-onchange */}
            <select defaultValue={mode} onChange={onChangeMode}>
              {modeList.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </li>
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
      )}
    </>
  );
};
