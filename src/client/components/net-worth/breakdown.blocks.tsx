/* @jsx jsx */
import { jsx } from '@emotion/react';
import { ReactElement } from 'react';

import { Label, LabelBaseProps } from './breakdown.styles';

export const getText = (value: string, level: LabelBaseProps['level']): ReactElement => (
  <Label small={false} level={level}>
    {value}
  </Label>
);
