import { Digit } from './digit';

import * as Styled from './styles';

const getDigit = (row: number, col: number): number => (row * 3 + col + 1) % 10;

type Props = {
  onInput: (digit: number) => void;
};

export const NumberInputPad: React.FC<Props> = ({ onInput }) => (
  <Styled.NumberInputPad>
    {Array(4)
      .fill(0)
      .map((_, row) =>
        row === 3 ? (
          <Styled.NumberInputRow key={row}>
            <Digit digit={0} onInput={onInput} />
          </Styled.NumberInputRow>
        ) : (
          <Styled.NumberInputRow key={row}>
            {Array(3)
              .fill(0)
              .map((__, col) => (
                <Digit key={getDigit(row, col)} digit={getDigit(row, col)} onInput={onInput} />
              ))}
          </Styled.NumberInputRow>
        ),
      )}
  </Styled.NumberInputPad>
);
