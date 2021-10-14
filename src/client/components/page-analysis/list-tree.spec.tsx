import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import ListTree, { Props } from './list-tree';
import { AnalysisPage } from '~client/types/enum';

describe('<PageAnalysis /> / <ListTree />', () => {
  const treeVisible = {
    [AnalysisPage.Food]: true,
    [AnalysisPage.General]: false,
    [AnalysisPage.Bills]: true,
  };

  const treeOpen = {
    [AnalysisPage.Food]: true,
    [AnalysisPage.General]: false,
    [AnalysisPage.Bills]: false,
    [AnalysisPage.Holiday]: true,
  };

  const props: Props = {
    cost: [
      { name: AnalysisPage.Food, derived: false, total: 1, subTree: [{ name: 'bar1', total: 1 }] },
      {
        name: AnalysisPage.General,
        derived: false,
        total: 4,
        subTree: [{ name: 'bar2', total: 2 }],
      },
      { name: AnalysisPage.Bills, derived: false, total: 3, subTree: [{ name: 'bar3', total: 2 }] },
      {
        name: AnalysisPage.Holiday,
        derived: false,
        total: 6,
        subTree: [{ name: 'bar4', total: 2 }],
      },
      {
        name: AnalysisPage.Social,
        derived: false,
        total: 10,
        subTree: [{ name: 'bar5', total: 3 }],
      },
    ],
    income: 30,
    treeVisible,
    treeOpen,
    toggleTreeItem: jest.fn(),
    setTreeOpen: jest.fn(),
    onHover: jest.fn(),
  };

  const getContainer = (customProps = {}): RenderResult =>
    render(<ListTree {...props} {...customProps} />);

  describe.each`
    index | name                    | visible  | open     | cost       | percent      | subItem
    ${1}  | ${AnalysisPage.Food}    | ${true}  | ${true}  | ${'£0.01'} | ${'(4.2%)'}  | ${'bar1'}
    ${2}  | ${AnalysisPage.General} | ${false} | ${false} | ${'£0.04'} | ${'(16.7%)'} | ${'bar2'}
    ${3}  | ${AnalysisPage.Bills}   | ${true}  | ${false} | ${'£0.03'} | ${'(12.5%)'} | ${'bar3'}
    ${4}  | ${AnalysisPage.Holiday} | ${true}  | ${true}  | ${'£0.06'} | ${'(25.0%)'} | ${'bar4'}
    ${5}  | ${AnalysisPage.Social}  | ${true}  | ${false} | ${'£0.10'} | ${'(41.7%)'} | ${'bar5'}
  `('for the "$name" test case', ({ index, name, visible, open, cost, percent, subItem }) => {
    it('should render the name', () => {
      expect.assertions(1);
      const { getByText } = getContainer();
      expect(getByText(name)).toBeInTheDocument();
    });

    it('should render a toggle input', () => {
      expect.assertions(2);
      const { container } = getContainer();
      const div = container.childNodes[0];
      const ul = div.childNodes[0];
      const child = ul.childNodes[index];
      const main = child.childNodes[0] as HTMLDivElement;
      const input = main.childNodes[1].childNodes[0] as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.checked).toBe(visible);
    });

    it('should render the cost', () => {
      expect.assertions(1);
      const { getAllByText } = getContainer();
      expect(getAllByText(cost).length).toBeGreaterThan(0);
    });

    it('should render the percentage', () => {
      expect.assertions(1);
      const { getAllByText } = getContainer();
      expect(getAllByText(percent).length).toBeGreaterThan(0);
    });

    if (open) {
      it('should render a subtree', () => {
        expect.assertions(1);
        const { getByText } = getContainer();
        expect(getByText(subItem)).toBeInTheDocument();
      });
    } else {
      it('should not render a subtree', () => {
        expect.assertions(1);
        const { queryByText } = getContainer();
        expect(queryByText(subItem)).not.toBeInTheDocument();
      });
    }

    it('should expand items on click', () => {
      expect.assertions(2);
      const { container } = getContainer();
      const div = container.childNodes[0];
      const ul = div.childNodes[0];
      const child = ul.childNodes[index];
      const main = child.childNodes[0];

      userEvent.click(main as Element);

      expect(props.setTreeOpen).toHaveBeenCalledTimes(1);
      expect(props.setTreeOpen).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle onMouseOver', () => {
      expect.assertions(2);
      const { container } = getContainer();
      const div = container.childNodes[0];
      const ul = div.childNodes[0];
      const child = ul.childNodes[index];
      const main = child.childNodes[0];

      userEvent.hover(main as Element);

      expect(props.onHover).toHaveBeenCalledTimes(1);
      expect(props.onHover).toHaveBeenCalledWith(name);
    });

    it('should handle onMouseOut', () => {
      expect.assertions(2);
      const { container } = getContainer();
      const div = container.childNodes[0];
      const ul = div.childNodes[0];
      const child = ul.childNodes[index];
      const main = child.childNodes[0];

      userEvent.unhover(main as Element);

      expect(props.onHover).toHaveBeenCalledTimes(1);
      expect(props.onHover).toHaveBeenCalledWith();
    });

    it('should handle toggling items by the tick box', () => {
      expect.assertions(2);
      const { container } = getContainer();
      const div = container.childNodes[0];
      const ul = div.childNodes[0];
      const child = ul.childNodes[index];
      const main = child.childNodes[0];
      const input = main.childNodes[1].childNodes[0] as HTMLInputElement;

      userEvent.click(input);

      expect(props.toggleTreeItem).toHaveBeenCalledTimes(1);
      expect(props.toggleTreeItem).toHaveBeenCalledWith(name);
    });
  });
});
