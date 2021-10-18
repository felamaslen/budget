export const composeWithoutArgs =
  (...fns: ((...args: any[]) => void)[]) =>
  (): void => {
    fns.forEach((fn) => fn());
  };
