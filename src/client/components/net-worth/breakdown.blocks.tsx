/* @jsx jsx */
import { jsx } from '@emotion/react';
import { ReactElement } from 'react';

import { Label } from '~client/components/fund-weights/styles';

export const getText = (value: string): ReactElement => <Label small={false}>{value}</Label>;
