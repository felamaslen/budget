import { useMediaQuery } from 'react-responsive';
import { breakpoints } from '~client/styled/variables';

export const useIsMobile = (): boolean =>
  useMediaQuery({ query: `(max-width: ${breakpoints.mobile - 1}px)` });
