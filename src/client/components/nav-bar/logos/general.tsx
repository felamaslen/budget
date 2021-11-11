import * as Styled from './styles';

export const LogoGeneral: React.FC = () => (
  <svg viewBox="0 0 100 100">
    <Styled.StrokedPath
      d={['M5,17 h13 l4,18 h66 l-6,33 h-53 l-7,-33 m4,11 h60 m-4,11 h-55'].join(' ')}
      fill="none"
      strokeWidth={6}
    />
    <Styled.FilledPath as="circle" cx={38} cy={86} r={11} />
    <Styled.FilledPath as="circle" cx={70} cy={86} r={11} />
  </svg>
);
