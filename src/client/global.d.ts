import { SSRData } from '@urql/core';
import { factory } from 'redux-devtools';
import { State } from './reducers';

declare global {
  declare module '*.png' {
    const url: string;
    export default url;
  }

  declare module '*.jpg' {
    const url: string;
    export default url;
  }

  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: factory;
    __URQL_DATA__?: SSRData;
    __API_KEY__?: string | null;
    __PRELOADED_STATE__?: State;
  }
}
