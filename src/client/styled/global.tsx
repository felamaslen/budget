/* @jsx jsx */
import { Global, jsx } from '@emotion/react';
import { Fragment } from 'react';

import { reset } from './reset';
import { Main } from './shared';

export const GlobalStylesProvider: React.FC = ({ children }) => (
  <Fragment>
    <Global styles={reset} />
    <Main>{children}</Main>
  </Fragment>
);
