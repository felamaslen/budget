import { render } from '@testing-library/react';
import { rgb } from 'polished';
import React from 'react';

import { FundGainInfo } from '.';
import { renderVisualTest } from '~client/test-utils';

describe('[visual] fund gain info', () => {
  it('should render as verified', async () => {
    expect.assertions(1);
    render(
      <FundGainInfo
        rowGains={{
          price: 1460,
          value: 8714423,
          gain: 0.381,
          gainAbs: 2344203,
          dayGain: 0.0076,
          dayGainAbs: 55842,
          color: rgb(30, 255, 128),
        }}
        isSold={false}
      />,
    );
    const screenshot = await renderVisualTest();
    expect(screenshot).toMatchImageSnapshot();
  });
});
