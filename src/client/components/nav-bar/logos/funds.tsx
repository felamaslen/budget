import * as Styled from './styles';

export const LogoFunds: React.FC = () => (
  <svg viewBox="0 0 100 100">
    <Styled.StrokedPath
      d={[
        'M',
        10,
        84,
        'L',
        20,
        72,
        'L',
        30,
        79,
        'L',
        40,
        55,
        'L',
        50,
        47,
        'L',
        60,
        62,
        'L',
        70,
        67,
        'L',
        80,
        38,
        'L',
        90,
        25,
      ].join(' ')}
      strokeWidth={8}
    />
  </svg>
);
