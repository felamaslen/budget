import pluralize from 'pluralize';
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';

import * as Styled from './styles';
import {
  FormFieldNumber,
  FormFieldRange,
  FormFieldSelect,
  SelectOptions,
} from '~client/components/form-field';
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

type TempQueryState = {
  lengths: Record<FundPeriod, number>;
  denominator: FundPeriod;
};

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

  const [tempQuery, debouncedQuery, setTempQuery] = useDebouncedState<TempQueryState>(
    {
      lengths: {
        [FundPeriod.Year]: 1,
        [FundPeriod.Month]: 6,
        [historyOptions.period]: historyOptions.length,
      },
      denominator: historyOptions.period,
    },
    300,
  );

  const periodSelectOptions = useMemo<SelectOptions<FundPeriod>>(
    () => [
      { internal: FundPeriod.Year, external: pluralize('Year', tempQuery.lengths.year) },
      { internal: FundPeriod.Month, external: pluralize('Month', tempQuery.lengths.month) },
    ],
    [tempQuery.lengths],
  );

  const modeSelectOptions = useMemo<SelectOptions<Mode>>(
    () => modeList.map((internal) => ({ internal })),
    [modeList],
  );

  const changePeriodDenominator = useCallback(
    (denominator: FundPeriod) => setTempQuery((last) => ({ ...last, denominator })),
    [setTempQuery],
  );

  const changePeriodLength = useCallback(
    (length: number) =>
      setTempQuery((last) => ({
        ...last,
        lengths: { ...last.lengths, [last.denominator]: Math.max(0, Math.round(length)) },
      })),
    [setTempQuery],
  );

  useUpdateEffect(() => {
    changePeriod({
      period: debouncedQuery.denominator,
      length: debouncedQuery.lengths[debouncedQuery.denominator],
    });
  }, [debouncedQuery, changePeriod]);

  const lengthProps = {
    value: tempQuery.lengths[tempQuery.denominator],
    onChange: changePeriodLength,
    min: 0,
    max: tempQuery.denominator === FundPeriod.Year ? 10 : 18,
  };

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
              <SettingsLabel>Length</SettingsLabel>
              <SettingsInput>
                {(isMobile && <FormFieldNumber {...lengthProps} />) || (
                  <FormFieldRange {...lengthProps} step={1} />
                )}
              </SettingsInput>
            </SettingsGroup>
            <Styled.PeriodLengthSettingsGroup>
              <SettingsLabel>Period</SettingsLabel>
              <SettingsInput>
                {isMobile && !tempQuery.lengths[tempQuery.denominator] ? (
                  <Styled.PeriodLengthIndicator>Unlimited</Styled.PeriodLengthIndicator>
                ) : null}
                {!isMobile && (
                  <Styled.PeriodLengthIndicator>
                    {tempQuery.lengths[tempQuery.denominator] || 'Unlimited'}
                  </Styled.PeriodLengthIndicator>
                )}
                {tempQuery.lengths[tempQuery.denominator] > 0 ? (
                  <FormFieldSelect
                    options={periodSelectOptions}
                    value={tempQuery.denominator}
                    onChange={changePeriodDenominator}
                  />
                ) : null}
              </SettingsInput>
            </Styled.PeriodLengthSettingsGroup>
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
