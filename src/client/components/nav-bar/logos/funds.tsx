import * as Styled from './styles';

export const LogoFunds: React.FC = () => (
  <svg viewBox="0 0 100 100">
    <Styled.StrokedPath
      d={[
        'M5,95',
        'c0,-20 0,-35 20,-32',
        'c10,0 60,10 50,-30',
        'c-3,-20 5,-26 20,-28',
        'a30,30 0,0,1 -20,30',
        'a40,40 0,0,0 -32,-24',
        'a28,28 0,0,0 32,24',
      ].join(' ')}
      strokeWidth={6}
    />
  </svg>
);
