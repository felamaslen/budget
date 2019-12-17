import differenceInMonths from 'date-fns/differenceInMonths';
import addMonths from 'date-fns/addMonths';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';

export const getMonthDatesList = (startDate: Date, endDate: Date): Date[] => {
  const startMonth = startOfMonth(startDate);
  const endMonth = endOfMonth(endDate);
  if (startMonth > endMonth) {
    return [];
  }
  const numMonths = differenceInMonths(endMonth, startMonth) + 1;
  if (numMonths < 1) {
    return [];
  }

  return new Array(numMonths).fill(0).map((item, index) => endOfMonth(addMonths(startDate, index)));
};
