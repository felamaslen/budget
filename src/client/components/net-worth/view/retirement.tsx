import numWords from 'num-words';
import pluralize from 'pluralize';

import { exponentialRegression } from '~client/modules/data';
import type { Data } from '~client/types';

export type Props = {
  ftiSeries: Data;
};

const ftiRequiredForRetirement = 1000;

const NeverRetire: React.FC = () => <span>Never retire!</span>;
const RetiredAlready: React.FC = () => <span>You may retire now!</span>;

export const Retirement: React.FC<Props> = ({ ftiSeries }) => {
  const positiveValues = ftiSeries.filter(([, fti]) => fti > 0);
  if (positiveValues.length < 2) {
    return <NeverRetire />;
  }

  const line = positiveValues.map(([, fti]) => fti);
  const { slope, intercept } = exponentialRegression(line);
  if (slope < 0) {
    return <NeverRetire />;
  }
  const indexRequired = (Math.log(ftiRequiredForRetirement) - intercept) / slope;
  const yearsRequired = Math.ceil((indexRequired - line.length) / 12);
  if (yearsRequired < 0) {
    return <RetiredAlready />;
  }

  const yearsRequiredString = yearsRequired < 20 ? numWords(yearsRequired) : yearsRequired;

  return (
    <span>
      Retire in {yearsRequiredString} {pluralize('year', yearsRequired)}
    </span>
  );
};
