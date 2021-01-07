import React, { useCallback } from 'react';

import { Step } from './constants';
import { FormContainer, Props as ContainerProps } from './form-container';
import * as Styled from './styles';
import { FormFieldDate } from '~client/components/form-field';
import type { Create, NetWorthEntryNative as Entry } from '~client/types';

type Props = {
  containerProps: Omit<ContainerProps, 'step'>;
  item: Create<Entry>;
  onEdit: (item: Create<Entry>) => void;
};

export const StepDate: React.FC<Props> = ({ containerProps, item, onEdit }) => {
  const onChange = useCallback((date) => onEdit({ ...item, date }), [item, onEdit]);

  return (
    <FormContainer {...containerProps} step={Step.Date}>
      <Styled.SectionTitle>{'On what date were the data collected?'}</Styled.SectionTitle>
      <FormFieldDate label="entry-date" value={item.date} onChange={onChange} />
    </FormContainer>
  );
};
