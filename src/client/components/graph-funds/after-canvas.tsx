import { Dispatch, SetStateAction, useCallback } from 'react';

import * as Styled from './styles';
import { FormFieldSelect, SelectOptions } from '~client/components/form-field';
import { useFundModeSelectOptions } from '~client/components/page-funds/hooks/ui';
import { GRAPH_FUNDS_OVERALL_ID } from '~client/constants/graph';
import { useCTA } from '~client/hooks';
import { SettingsGroup, SettingsInput, SettingsLabel } from '~client/styled/shared/settings';
import type { Id, FundItem, HistoryOptions } from '~client/types';
import { FundMode, FundPeriod } from '~client/types/enum';
import { abbreviateFundName } from '~shared/abbreviation';

export type ToggleList = Record<string, boolean | null>;

export type Props = Pick<ItemProps, 'toggleList' | 'setToggleList'> & {
  historyOptions: HistoryOptions;
  mode: FundMode;
  changeMode: Dispatch<FundMode>;
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
    setToggleList((last: ToggleList): ToggleList => {
      const next = { ...last, [id]: last[id] === false };
      if (Object.keys(next).length === numItems && Object.values(next).every((value) => !value)) {
        return last;
      }

      return next;
    });
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

export const periodSelectOptions: SelectOptions<HistoryOptions> = [
  { internal: { period: FundPeriod.Month, length: 3 }, external: '3 months' },
  { internal: { period: FundPeriod.Ytd, length: null }, external: 'YTD' },
  { internal: { period: FundPeriod.Year, length: 1 }, external: '1 year' },
  { internal: { period: FundPeriod.Year, length: 3 }, external: '3 years' },
  { internal: { period: FundPeriod.Year, length: 5 }, external: '5 years' },
  { internal: { period: FundPeriod.Year, length: 0 }, external: 'Max' },
];

export const AfterCanvas: React.FC<Props> = ({
  historyOptions,
  mode,
  changeMode,
  fundItems,
  toggleList,
  setToggleList,
  sidebarOpen,
  setSidebarOpen,
  changePeriod,
}) => {
  const modeSelectOptions = useFundModeSelectOptions(false);
  return (
    <>
      <Styled.FundModeSwitch>
        <SettingsGroup>
          <SettingsLabel>Period</SettingsLabel>
          <SettingsInput>
            <Styled.FundPeriodSwitch>
              {periodSelectOptions.map(({ internal, external }) => (
                <Styled.FundPeriodButton
                  key={external}
                  active={
                    internal.period === historyOptions.period &&
                    (typeof internal.length === 'undefined' ||
                      internal.length === historyOptions.length)
                  }
                  onClick={(): void => changePeriod(internal)}
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
      {mode !== FundMode.Calendar && (
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
