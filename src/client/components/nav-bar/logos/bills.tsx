import * as Styled from './styles';

export const LogoBills: React.FC = () => (
  <svg viewBox="0 0 100 100">
    <Styled.FilledPath as="g" fillRule="evenodd">
      <path
        d={[
          'M',
          12,
          4,
          'l',
          12,
          10,
          'l',
          12,
          -10,
          'l',
          12,
          10,
          'l',
          12,
          -10,
          'l',
          12,
          10,
          'l',
          12,
          -10,
          'l',
          0,
          92,
          'l',
          -12,
          -10,
          'l',
          -12,
          10,
          'l',
          -12,
          -10,
          'l',
          -12,
          10,
          'l',
          -12,
          -10,
          'l',
          -12,
          10,
          'M 24,34 h33 v4 h-33 v-4',
          'M 24,46 h44 v4 h-44 v-4',
          'M 24,58 h44 v4 h-44 v-4',
          'z',
        ].join(' ')}
      />
    </Styled.FilledPath>
  </svg>
);
