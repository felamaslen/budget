import { createContext } from 'react';

import type { PageFundsContext } from './types';

export const FundsContext = createContext<PageFundsContext>({} as PageFundsContext);
