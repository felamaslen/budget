import { DateTime } from 'luxon';
import { State } from '~client/reducers';

type GetNow = (state: State) => DateTime;
export const getNow: GetNow;

export const getCurrentDate: GetNow;
