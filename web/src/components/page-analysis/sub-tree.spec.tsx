import { render, fireEvent, RenderResult, act } from '@testing-library/react';
import React from 'react';

import { SubTree } from './sub-tree';
import { AnalysisPage, MainBlockName } from '~client/types';

describe('<PageAnalysis /> / <SubTree />', () => {
  const props = {
    open: true,
    subTree: [
      { name: AnalysisPage.Food, total: 2 },
      { name: AnalysisPage.General, total: 4 },
    ],
    name: AnalysisPage.Food as MainBlockName,
    itemCost: 6,
    onHover: jest.fn(),
  };

  const getContainer = (customProps = {}): RenderResult =>
    render(<SubTree {...props} {...customProps} />);

  it.each`
    position    | name                    | cost    | percent
    ${'first'}  | ${AnalysisPage.Food}    | ${0.02} | ${33.3}
    ${'second'} | ${AnalysisPage.General} | ${0.04} | ${66.7}
  `('should render the $position item', ({ name, cost, percent }) => {
    expect.assertions(3);
    const { queryByText } = getContainer();

    expect(queryByText(name)).toBeInTheDocument();
    expect(queryByText(`£${cost}`)).toBeInTheDocument();
    expect(queryByText(`(${percent}%)`)).toBeInTheDocument();
  });

  it.each`
    position    | index | name
    ${'first'}  | ${0}  | ${AnalysisPage.Food}
    ${'second'} | ${1}  | ${AnalysisPage.General}
  `('should call onHover on mouse over of the $position item', ({ index, name }) => {
    const { container } = getContainer();

    act(() => {
      fireEvent.mouseOver(container.childNodes[0].childNodes[index]);
    });

    expect(props.onHover).toHaveBeenCalledTimes(1);
    expect(props.onHover).toHaveBeenCalledWith(AnalysisPage.Food, name);
  });

  it.each`
    condition                | props
    ${'not open'}            | ${{ open: false }}
    ${'there is no subtree'} | ${{ subTree: null }}
  `('should not render anything if $condition', ({ props: customProps }) => {
    expect.assertions(1);
    const { container } = getContainer(customProps);
    expect(container.childNodes).toHaveLength(0);
  });
});
