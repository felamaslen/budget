/* @jsx jsx */
import { jsx } from '@emotion/react';
import formatISO from 'date-fns/formatISO';
import { Dispatch, FC, Fragment, SetStateAction, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { configUpdatedFromLocal } from '~client/actions';

import { FormFieldDate, FormFieldSelect, FormFieldTickbox } from '~client/components/form-field';
import { periodSelectOptions } from '~client/components/graph-funds/after-canvas';
import { useFundModeSelectOptions } from '~client/components/page-funds/hooks';
import { useIsMobile } from '~client/hooks';
import { getAppConfig } from '~client/selectors';
import { Button } from '~client/styled/shared';
import * as Styled from '~client/styled/shared/settings';
import { LocalAppConfig } from '~client/types';

export type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export const Config: FC<Props> = ({ open, setOpen }) => {
  const isMobile = useIsMobile();
  const dispatch = useDispatch();
  const appConfig = useSelector(getAppConfig);
  const [tempAppConfig, setTempAppConfig] = useState<LocalAppConfig>(appConfig);
  useEffect(() => {
    if (open) {
      setTempAppConfig(appConfig);
    }
  }, [appConfig, open]);

  const fundModeSelectOptions = useFundModeSelectOptions(isMobile);

  if (!open) {
    return null;
  }

  return (
    <Fragment>
      <Styled.SettingsBackgroundModal onClick={(): void => setOpen(false)} />
      <Styled.SettingsDialog>
        <Styled.SettingsGuild>
          <h3>Global Settings</h3>
          <Styled.SettingsGroupModal>
            <Styled.SettingsLabelModal>Date of birth</Styled.SettingsLabelModal>
            <Styled.SettingsInput>
              <FormFieldDate
                onChange={(date): void =>
                  setTempAppConfig((last) => ({
                    ...last,
                    birthDate: formatISO(date, { representation: 'date' }),
                  }))
                }
                value={new Date(tempAppConfig.birthDate)}
              />
            </Styled.SettingsInput>
          </Styled.SettingsGroupModal>
        </Styled.SettingsGuild>
        <Styled.SettingsGuild>
          <h3>Funds</h3>
          <Styled.SettingsGroupModal>
            <Styled.SettingsLabelModal>Real-time prices</Styled.SettingsLabelModal>
            <Styled.SettingsInput>
              <FormFieldTickbox
                value={tempAppConfig.realTimePrices}
                onChange={(realTimePrices): void =>
                  setTempAppConfig((last) => ({ ...last, realTimePrices }))
                }
              />
            </Styled.SettingsInput>
          </Styled.SettingsGroupModal>
          <Styled.SettingsGroupModal>
            <Styled.SettingsLabelModal>Period</Styled.SettingsLabelModal>
            <Styled.SettingsInput>
              <FormFieldSelect
                options={periodSelectOptions}
                value={tempAppConfig.historyOptions}
                onChange={(historyOptions): void =>
                  setTempAppConfig((last) => ({ ...last, historyOptions }))
                }
              />
            </Styled.SettingsInput>
          </Styled.SettingsGroupModal>
          <Styled.SettingsGroupModal>
            <Styled.SettingsLabelModal>Mode</Styled.SettingsLabelModal>
            <Styled.SettingsInput>
              <FormFieldSelect
                options={fundModeSelectOptions}
                value={tempAppConfig.fundMode}
                onChange={(fundMode): void => setTempAppConfig((last) => ({ ...last, fundMode }))}
              />
            </Styled.SettingsInput>
          </Styled.SettingsGroupModal>
        </Styled.SettingsGuild>
        <Styled.SettingsGroupModal>
          <Button
            onClick={(): void => {
              dispatch(configUpdatedFromLocal(tempAppConfig));
            }}
          >
            Apply
          </Button>
        </Styled.SettingsGroupModal>
      </Styled.SettingsDialog>
    </Fragment>
  );
};
