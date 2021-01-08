/* @jsx jsx */
import { jsx } from '@emotion/react';
import { ReactElement } from 'react';

import { Label } from './breakdown.styles';

export const getText = (value: string, subBlock = false): ReactElement => (
  <Label small={false} subBlock={subBlock}>
    {value}
  </Label>
);
