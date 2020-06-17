import moize from 'moize';
import { createContext, Context } from 'react';
import { ItemExtraPropsMap } from './hooks';

export const createListContext = moize(
  <E extends {}>(): Context<ItemExtraPropsMap<E>> => createContext({}),
);
