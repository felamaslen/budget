import React, { ComponentType, FC } from 'react';

function loadable<Props extends Record<string, unknown> = Record<string, unknown>>(load: {
  importAsync: () => Promise<{ default: ComponentType<Props> }>;
}): ComponentType<Props> {
  let Component: ComponentType<Props>;
  const loadPromise = load.importAsync().then((val) => {
    Component = val.default;
  });
  const Loadable: FC<Props> & { load: () => Promise<void> } = (props: Props) => {
    if (!Component) {
      throw new Error(
        // eslint-disable-next-line max-len
        `Bundle split module not loaded yet, ensure you beforeAll(() => MyLazyComponent.load()) in your test, import statement: ${load.toString()}`,
      );
    }
    return <Component {...props} />;
  };
  Loadable.load = (): Promise<void> => loadPromise;
  return Loadable;
}

export default loadable;
