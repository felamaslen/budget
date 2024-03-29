import * as Styled from './styles';

export const LogoFood: React.FC = () => (
  <svg viewBox="0 0 100 100">
    <Styled.FilledPath
      d={['M14,10', 'l75,75', 'a10,10 0,0,1 -10,10', 'l-36,-36', 'c -50,-30 -31,-49 -29,-49'].join(
        ' ',
      )}
    />
    <g transform="rotate(45 58 42)">
      <Styled.FilledPath
        d={[
          'M45,12',
          'a2,2 0,0,1 5,0',
          'l0,10',
          'a2,2 0,0,0 5,0',
          'l0,-10',
          'a2,2 0,0,1 5,0',
          'l0,10',
          'a2,2 0,0,0 5,0',
          'l0,-10',
          'a2,2 0,0,1 5,0',
          'l0,20',
          'c 0,12 -10,12 -12,12',
          'c -12,0 -13,-12 -13,-12',
          'm5,38',
          'h15',
          'v35',
          'a6,6 0,0,1 -15,0',
          'v-25',
        ].join(' ')}
      />
    </g>
  </svg>
);
