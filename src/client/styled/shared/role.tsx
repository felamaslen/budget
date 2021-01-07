import React, { HTMLAttributes } from 'react';

const asA11yRole = (role: string, tabIndex: number | undefined) =>
  function asRole<P extends HTMLAttributes<E>, E extends HTMLElement>(
    Component: React.FC<P>,
  ): React.FC<P> {
    const WrappedComponent: React.FC<P> = (props) => (
      <Component {...props} role={role} tabIndex={tabIndex} />
    );
    WrappedComponent.displayName = Component.displayName;
    return WrappedComponent;
  };

export const asButton = asA11yRole('button', 0);
export const asLink = asA11yRole('link', 0);
export const asHeading = asA11yRole('heading', undefined);
