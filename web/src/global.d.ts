import { factory } from 'redux-devtools';

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
  }
}
