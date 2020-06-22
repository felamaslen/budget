import React, { useCallback, useState } from 'react';

import * as Styled from './styles';
import { Mode, Period, GRAPH_FUNDS_PERIODS } from '~client/constants/graph';
import { useCTA } from '~client/hooks';
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
};

type Props = {
  isMobile: boolean;
  period: Period;
  mode: Mode;
  fundItems: FundItem[];
  toggleList: ToggleList;
  setToggleList: SetToggleList;
  changePeriod: (nextPeriod: Period) => void;
};

const Item: React.FC<ItemProps> = ({ numItems, toggleList, setToggleList, id, color, item }) => {
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
      ></Styled.SidebarCheckbox>
      <Styled.SidebarFund>{item}</Styled.SidebarFund>
    </li>
  );
};

export const AfterCanvas: React.FC<Props> = ({
  isMobile,
  period,
  mode,
  fundItems,
  toggleList,
  setToggleList,
  changePeriod,
}) => {
  const onChange = useCallback(({ target: { value } }) => changePeriod(value), [changePeriod]);
  const [sidebarActive, setSidebarActive] = useState<boolean>(false);
  const onHoverSidebar = useCallback(() => setSidebarActive(true), []);
  const onBlurSidebar = useCallback(() => setSidebarActive(false), []);

  return (
    <>
      {!isMobile && (
        <Styled.FundSidebar
          tabIndex={-1}
          isActive={sidebarActive}
          onMouseOver={onHoverSidebar}
          onFocus={onHoverSidebar}
          onMouseOut={onBlurSidebar}
          onBlur={onBlurSidebar}
        >
          <li>
            <select defaultValue={period} onBlur={onChange}>
              {GRAPH_FUNDS_PERIODS.map(([key, display]: [string, Period]) => (
                <option key={key} value={display}>
                  {display}
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
                toggleList={toggleList}
                setToggleList={setToggleList}
              />
            ))}
        </Styled.FundSidebar>
      )}
      <Styled.Mode>Mode: {mode}</Styled.Mode>
    </>
  );
};
