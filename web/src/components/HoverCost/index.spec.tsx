import { render, fireEvent, act, RenderResult } from '@testing-library/react';
import React from 'react';
import HoverCost from '.';

describe('<HoverCost />', () => {
  const props = {
    value: 123456.78,
  };

  const getContainer = (customProps = {}): RenderResult => {
    return render(<HoverCost {...props} {...customProps} />);
  };

  // prettier-ignore
  describe.each`
  type          | value
  ${'string'}   | ${'foo'}
  `('when rendering a $type value', ({ value }) => {
    it('should render its value unmodified', () => {
      expect.assertions(1);
      const { getByText } = getContainer({
        value,
      });

      expect(getByText(value)).toBeInTheDocument();
    });
  });

  describe('when rendering a currency value', () => {
    it('should render an abbreviated value', () => {
      expect.assertions(1);
      const { getByText } = getContainer();
      expect(getByText('£1.2k')).toBeInTheDocument();
    });

    describe('when hovering', () => {
      it('should render a hover label', () => {
        expect.assertions(2);
        const { queryByText, getByText } = getContainer();
        act(() => {
          fireEvent.mouseEnter(getByText('£1.2k'));
        });
        expect(queryByText('£1.2k')).not.toBeInTheDocument();
        expect(queryByText('£1,234.57')).toBeInTheDocument();
      });

      it('should hide the hover label when mousing out', () => {
        expect.assertions(2);
        const { queryByText, getByText } = getContainer();
        act(() => {
          fireEvent.mouseEnter(getByText('£1.2k'));
        });
        act(() => {
          fireEvent.mouseLeave(getByText('£1,234.57'));
        });
        expect(queryByText('£1.2k')).toBeInTheDocument();
        expect(queryByText('£1,234.57')).not.toBeInTheDocument();
      });
    });
  });
});
