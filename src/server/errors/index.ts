import * as netWorth from '~/server/errors/net-worth';

interface ErrorResponse {
  status: number;
  message: string;
}

type ErrorMaker = ErrorResponse | ((...args: any[]) => ErrorResponse);

class NativeError extends Error {
  constructor(message: string) {
    super(message);

    this.name = '';
    this.code = 0;
    this.message = message;
  }

  name: string;

  code: number;

  message: string;
}

type NativeErrorMaker = (...args: any[]) => NativeError;

const toNativeError = (maker: ErrorMaker): NativeErrorMaker => (...args: any[]): NativeError => {
  const info: ErrorResponse = typeof maker === 'function' ? maker(...args) : maker;

  const error = new NativeError(info.message);
  error.code = info.status;

  return error;
};

function makeErrors(
  ...args: {
    [error: string]: ErrorMaker;
  }[]
): {
  [error: string]: (...args: any[]) => NativeError;
} {
  return args.reduce(
    (
      last: {
        [error: string]: NativeErrorMaker;
      },
      makers: {
        [x: string]: ErrorMaker;
      },
    ) =>
      Object.keys(makers).reduce(
        (
          thisLast: {
            [error: string]: NativeErrorMaker;
          },
          errorType: string,
        ) => ({
          ...thisLast,
          [errorType]: toNativeError(makers[errorType]),
        }),
        last,
      ),
    {},
  );
}

export default makeErrors(netWorth);
