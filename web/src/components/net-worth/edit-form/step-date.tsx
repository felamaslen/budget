import React, { useCallback } from 'react';

import { Step } from './constants';
import { FormContainer, Props as ContainerProps } from './form-container';
import * as Styled from './styles';
import { FormFieldDate } from '~client/components/form-field';
import { CreateEdit } from '~client/types';
import { Entry } from '~client/types/net-worth';

type Props = {
  containerProps: ContainerProps;
  item: CreateEdit<Entry>;
  onEdit: (item: CreateEdit<Entry>) => void;
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
