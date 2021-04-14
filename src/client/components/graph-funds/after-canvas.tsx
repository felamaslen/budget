import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';

import * as Styled from './styles';
import { FormFieldSelect, SelectOptions } from '~client/components/form-field';
import { GRAPH_FUNDS_OVERALL_ID, Mode } from '~client/constants/graph';
import { useCTA, useDebouncedState, useUpdateEffect } from '~client/hooks';
import { abbreviateFundName } from '~client/modules/finance';
import { Hamburger } from '~client/styled/shared/hamburger';
import {
  SettingsBackground,
  SettingsGroup,
  SettingsInput,
  SettingsLabel,
} from '~client/styled/shared/settings';
import type { Id, FundItem, HistoryOptions } from '~client/types';
import { FundPeriod } from '~client/types/gql';

export type ToggleList = Record<string, boolean | null>;

export type Props = Pick<ItemProps, 'toggleList' | 'setToggleList'> & {
  isMobile: boolean;
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

const periodSelectOptions: SelectOptions<HistoryOptions> = [
  { internal: { period: FundPeriod.Month, length: 3 }, external: '3 months' },
  { internal: { period: FundPeriod.Ytd }, external: 'YTD' },
  { internal: { period: FundPeriod.Year, length: 1 }, external: '1 year' },
  { internal: { period: FundPeriod.Year, length: 3 }, external: '3 years' },
  { internal: { period: FundPeriod.Year, length: 5 }, external: '5 years' },
  { internal: { period: FundPeriod.Year, length: 0 }, external: 'Max' },
];

export const AfterCanvas: React.FC<Props> = ({
  isMobile,
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
  const [mobileActive, setMobileActive] = useState<boolean>(false);

  const [tempQuery, debouncedQuery, setTempQuery] = useDebouncedState<HistoryOptions>(
    historyOptions,
  );

  const modeSelectOptions = useMemo<SelectOptions<Mode>>(
    () => modeList.map((internal) => ({ internal })),
    [modeList],
  );

  useUpdateEffect(() => {
    changePeriod({
      period: debouncedQuery.period,
      length: debouncedQuery.length,
    });
  }, [debouncedQuery, changePeriod]);

  return (
    <>
      {isMobile && (
        <Styled.MobileSettingsButton onClick={(): void => setMobileActive((last) => !last)}>
          <Hamburger />
        </Styled.MobileSettingsButton>
      )}
      {(!isMobile || mobileActive) && (
        <>
          <SettingsBackground onClick={(): void => setMobileActive(false)} />
          <Styled.FundModeSwitch>
            <SettingsGroup>
              <SettingsLabel>Period</SettingsLabel>
              <SettingsInput>
                <Styled.FundPeriodSwitch>
                  {periodSelectOptions.map(({ internal, external }) => (
                    <Styled.FundPeriodButton
                      key={external}
                      active={
                        internal.period === tempQuery.period &&
                        (typeof internal.length === 'undefined' ||
                          internal.length === tempQuery.length)
                      }
                      onClick={(): void => setTempQuery(internal)}
                    >
                      {external}
                    </Styled.FundPeriodButton>
                  ))}
                </Styled.FundPeriodSwitch>
              </SettingsInput>
            </SettingsGroup>
            <SettingsGroup>
              <SettingsLabel>Mode</SettingsLabel>
              <SettingsInput>
                <FormFieldSelect options={modeSelectOptions} value={mode} onChange={changeMode} />
              </SettingsInput>
            </SettingsGroup>
          </Styled.FundModeSwitch>
        </>
      )}
      {!isMobile && (
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
      )}
    </>
  );
};
