import * as Styled from './styles';

export const LogoOverview: React.FC = () => (
  <svg viewBox="0 0 100 100">
    <Styled.StrokedPath d={['M5,29', 'l45,-20', 'l45,20', 'h-90', 'z'].join(' ')} strokeWidth={5} />
    <Styled.StrokedPath
      d={['M12,29', 'v14', 'h76', 'v-14', 'm0,56', 'h-76', 'l-5,10', 'h86', 'l-5,-10', 'z'].join(
        ' ',
      )}
      strokeWidth={5}
    />
    <Styled.FilledPath x={14} y={43} width={8} height={42} as="rect" />
    <Styled.FilledPath x={30} y={43} width={8} height={42} as="rect" />
    <Styled.FilledPath x={46} y={43} width={8} height={42} as="rect" />
    <Styled.FilledPath x={62} y={43} width={8} height={42} as="rect" />
    <Styled.FilledPath x={78} y={43} width={8} height={42} as="rect" />
  </svg>
);
