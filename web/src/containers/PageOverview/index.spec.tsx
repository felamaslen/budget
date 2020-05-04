/* eslint-disable max-len */
import sinon from 'sinon';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import PageOverview from '.';
import '~client/mocks/match-media';
import { testState } from '~client/test-data/state';
import { mockRandom } from '~client/mocks/random';
import { State } from '~client/reducers';

describe('<PageOverview />', () => {
  const mockStore = configureStore<State>();
  const getContainer = (): RenderResult =>
    render(
      <MemoryRouter>
        <Provider store={mockStore(testState)}>
          <PageOverview />
        </Provider>
      </MemoryRouter>,
    );

  it('should render a table', () => {
    expect.assertions(1);
    mockRandom();
    const clock = sinon.useFakeTimers();
    const { getByTestId } = getContainer();
    expect(getByTestId('overview-table')).toMatchInlineSnapshot(`
      <div
        class="sc-bdVaJa bIJcwP"
        data-testid="overview-table"
      >
        <div
          class="sc-htpNat sc-ifAKCX Xrznz"
        >
          <div
            class="sc-bxivhb sc-EHOje gryqJc"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Month
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje coasnK"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Stocks
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje coasnK"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Bills
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje coasnK"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Food
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje coasnK"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              General
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje coasnK"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Holiday
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje coasnK"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Social
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje fXkNjZ"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Income
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje iSErfp"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Out
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje cBtrwg"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Net
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje gqTUbD"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Predicted
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje cXWcfV"
          >
            <a
              class="sc-bZQynM jdQAmB"
              href="/net-worth"
            >
              Net Worth
            </a>
          </div>
        </div>
        <div
          class="sc-bwzfXH fuAqIe"
        >
          <div
            class="sc-htpNat kjPaM"
          >
            <div
              class="sc-bxivhb jfSVUT"
            >
              <span>
                Jan-18
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £1k
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(183, 28, 28);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £10.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(67, 160, 71);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.5
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(1, 87, 155);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £1.50
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.1
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.5
              </span>
            </div>
            <div
              class="sc-bxivhb hLBMqG"
              style="background-color: rgb(146, 223, 155);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £20.00
              </span>
            </div>
            <div
              class="sc-bxivhb fPGNYZ"
              style="background-color: rgb(211, 103, 103);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £12.60
              </span>
            </div>
            <div
              class="sc-bxivhb JzZId"
              style="background-color: rgb(202, 239, 206);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £7.40
              </span>
            </div>
            <div
              class="sc-bxivhb fSxTEn"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb kHsobB"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
          </div>
          <div
            class="sc-htpNat kjPaM"
          >
            <div
              class="sc-bxivhb jfSVUT"
            >
              <span>
                Feb-18
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(235, 238, 239);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £1k
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(189, 47, 47);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £9.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.1
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(128, 171, 205);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.9
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(0, 137, 123);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £10.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(223, 207, 146);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.7
              </span>
            </div>
            <div
              class="sc-bxivhb hLBMqG"
              style="background-color: rgb(167, 229, 175);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £19.00
              </span>
            </div>
            <div
              class="sc-bxivhb fPGNYZ"
              style="background-color: rgb(191, 36, 36);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £20.68
              </span>
            </div>
            <div
              class="sc-bxivhb JzZId"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                (£1.68)
              </span>
            </div>
            <div
              class="sc-bxivhb fSxTEn"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £5.12
              </span>
            </div>
            <div
              class="sc-bxivhb kHsobB"
              style="background-color: rgb(36, 191, 55);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £13k
              </span>
            </div>
          </div>
          <div
            class="sc-htpNat jgKGyg"
          >
            <div
              class="sc-bxivhb fqMtTN"
            >
              <span>
                Mar-18
              </span>
            </div>
            <div
              class="sc-bxivhb egfsBe"
              style="background-color: rgb(190, 200, 204);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £1k
              </span>
            </div>
            <div
              class="sc-bxivhb egfsBe"
              style="background-color: rgb(219, 142, 142);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £4.00
              </span>
            </div>
            <div
              class="sc-bxivhb egfsBe"
              style="background-color: rgb(161, 208, 163);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.3
              </span>
            </div>
            <div
              class="sc-bxivhb egfsBe"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.1
              </span>
            </div>
            <div
              class="sc-bxivhb egfsBe"
              style="background-color: rgb(128, 196, 189);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £1.28
              </span>
            </div>
            <div
              class="sc-bxivhb egfsBe"
              style="background-color: rgb(191, 158, 36);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £1.81
              </span>
            </div>
            <div
              class="sc-bxivhb ifBTGL"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £15.00
              </span>
            </div>
            <div
              class="sc-bxivhb huWcdu"
              style="background-color: rgb(223, 146, 146);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £7.49
              </span>
            </div>
            <div
              class="sc-bxivhb iAthgK"
              style="background-color: rgb(201, 239, 205);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £7.51
              </span>
            </div>
            <div
              class="sc-bxivhb kpgRfT"
              style="background-color: rgb(146, 223, 155);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £13k
              </span>
            </div>
            <div
              class="sc-bxivhb ihyNBd"
              style="background-color: rgb(80, 204, 95);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £10.4k
              </span>
            </div>
          </div>
          <div
            class="sc-htpNat fCMRGf"
          >
            <div
              class="sc-bxivhb iqPouv"
            >
              <span>
                Apr-18
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(170, 183, 189);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £1k
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(204, 94, 94);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £6.50
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(161, 208, 163);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.3
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(128, 171, 205);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.9
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(128, 196, 189);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £1.28
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(223, 207, 146);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.7
              </span>
            </div>
            <div
              class="sc-bxivhb bNTNvC"
              style="background-color: rgb(54, 196, 72);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £25.00
              </span>
            </div>
            <div
              class="sc-bxivhb jzbxwy"
              style="background-color: rgb(218, 128, 128);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £9.60
              </span>
            </div>
            <div
              class="sc-bxivhb lgvHlb"
              style="background-color: rgb(142, 222, 152);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £15.40
              </span>
            </div>
            <div
              class="sc-bxivhb kdLode"
              style="background-color: rgb(146, 223, 155);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £13k
              </span>
            </div>
            <div
              class="sc-bxivhb jhuyHm"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
          </div>
          <div
            class="sc-htpNat fCMRGf"
          >
            <div
              class="sc-bxivhb iqPouv"
            >
              <span>
                May-18
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(141, 158, 166);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £1k
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(161, 208, 163);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.3
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(128, 171, 205);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.9
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(128, 196, 189);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £1.28
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(223, 207, 146);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.7
              </span>
            </div>
            <div
              class="sc-bxivhb bNTNvC"
              style="background-color: rgb(91, 207, 105);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £23.00
              </span>
            </div>
            <div
              class="sc-bxivhb jzbxwy"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £3.10
              </span>
            </div>
            <div
              class="sc-bxivhb lgvHlb"
              style="background-color: rgb(78, 203, 94);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £19.90
              </span>
            </div>
            <div
              class="sc-bxivhb kdLode"
              style="background-color: rgb(108, 212, 121);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £13.1k
              </span>
            </div>
            <div
              class="sc-bxivhb jhuyHm"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
          </div>
          <div
            class="sc-htpNat fCMRGf"
          >
            <div
              class="sc-bxivhb iqPouv"
            >
              <span>
                Jun-18
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(113, 134, 144);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £1.1k
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(161, 208, 163);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.3
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(128, 171, 205);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.9
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(128, 196, 189);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £1.28
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(223, 207, 146);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.7
              </span>
            </div>
            <div
              class="sc-bxivhb bNTNvC"
              style="background-color: rgb(189, 236, 195);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £18.00
              </span>
            </div>
            <div
              class="sc-bxivhb jzbxwy"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £3.10
              </span>
            </div>
            <div
              class="sc-bxivhb lgvHlb"
              style="background-color: rgb(147, 224, 157);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £14.90
              </span>
            </div>
            <div
              class="sc-bxivhb kdLode"
              style="background-color: rgb(78, 203, 93);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £13.1k
              </span>
            </div>
            <div
              class="sc-bxivhb jhuyHm"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
          </div>
          <div
            class="sc-htpNat fCMRGf"
          >
            <div
              class="sc-bxivhb iqPouv"
            >
              <span>
                Jul-18
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(84, 110, 122);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £1.1k
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(161, 208, 163);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.3
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(128, 171, 205);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.9
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(128, 196, 189);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £1.28
              </span>
            </div>
            <div
              class="sc-bxivhb fBJWDU"
              style="background-color: rgb(223, 207, 146);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.7
              </span>
            </div>
            <div
              class="sc-bxivhb bNTNvC"
              style="background-color: rgb(36, 191, 55);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £26.00
              </span>
            </div>
            <div
              class="sc-bxivhb jzbxwy"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £3.10
              </span>
            </div>
            <div
              class="sc-bxivhb lgvHlb"
              style="background-color: rgb(36, 191, 55);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £22.90
              </span>
            </div>
            <div
              class="sc-bxivhb kdLode"
              style="background-color: rgb(36, 191, 55);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £13.1k
              </span>
            </div>
            <div
              class="sc-bxivhb jhuyHm"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
          </div>
        </div>
      </div>
    `);

    clock.restore();
  });

  it('should render graphs', () => {
    expect.assertions(1);
    mockRandom();
    const clock = sinon.useFakeTimers();
    const { getByTestId } = getContainer();
    expect(getByTestId('graph-overview')).toMatchInlineSnapshot(`
      <div
        class="sc-hzDkRC sc-fMiknA bmTdHa"
        data-testid="graph-overview"
      >
        <div
          class="sc-bRBYWo hltnta"
          height="300"
          width="500"
        >
          <svg
            data-testid="graph-svg"
            height="300"
            width="500"
          >
            <g>
              <g>
                <g>
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="300.5"
                    y2="300.5"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="200.5"
                    y2="200.5"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="101.5"
                    y2="101.5"
                  />
                </g>
                <g>
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="280.5"
                    y2="280.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="260.5"
                    y2="260.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="240.5"
                    y2="240.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="220.5"
                    y2="220.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="180.5"
                    y2="180.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="161.5"
                    y2="161.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="141.5"
                    y2="141.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="121.5"
                    y2="121.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="81.5"
                    y2="81.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="61.5"
                    y2="61.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="42.5"
                    y2="42.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="22.5"
                    y2="22.5"
                  />
                </g>
                <g>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    text-anchor="start"
                    x="0"
                    y="298.5"
                  >
                    £0
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    text-anchor="start"
                    x="0"
                    y="198.5"
                  >
                    £5k
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    text-anchor="start"
                    x="0"
                    y="99.5"
                  >
                    £10k
                  </text>
                </g>
                <g>
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="-8.5"
                    x2="-8.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="0.5"
                    x1="0.5"
                    x2="0.5"
                    y1="285"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="11.5"
                    x2="11.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="30.5"
                    x2="30.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="49.5"
                    x2="49.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="69.5"
                    x2="69.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="0.5"
                    x1="77.5"
                    x2="77.5"
                    y1="285"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="88.5"
                    x2="88.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="107.5"
                    x2="107.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="127.5"
                    x2="127.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="146.5"
                    x2="146.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="0.5"
                    x1="162.5"
                    x2="162.5"
                    y1="285"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="165.5"
                    x2="165.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="185.5"
                    x2="185.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="204.5"
                    x2="204.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="223.5"
                    x2="223.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="243.5"
                    x2="243.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="0.5"
                    x1="245.5"
                    x2="245.5"
                    y1="285"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="262.5"
                    x2="262.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="281.5"
                    x2="281.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="301.5"
                    x2="301.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="320.5"
                    x2="320.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="0.5"
                    x1="331.5"
                    x2="331.5"
                    y1="285"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="339.5"
                    x2="339.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="359.5"
                    x2="359.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="378.5"
                    x2="378.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="397.5"
                    x2="397.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="0.5"
                    x1="414.5"
                    x2="414.5"
                    y1="285"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="417.5"
                    x2="417.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="436.5"
                    x2="436.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="455.5"
                    x2="455.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="475.5"
                    x2="475.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="494.5"
                    x2="494.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="0.5"
                    x1="500.5"
                    x2="500.5"
                    y1="285"
                    y2="0"
                  />
                </g>
                <g>
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="-8.5"
                    x2="-8.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                    x1="0.5"
                    x2="0.5"
                    y1="300"
                    y2="285"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="11.5"
                    x2="11.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="30.5"
                    x2="30.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="49.5"
                    x2="49.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="69.5"
                    x2="69.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                    x1="77.5"
                    x2="77.5"
                    y1="300"
                    y2="285"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="88.5"
                    x2="88.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="107.5"
                    x2="107.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="127.5"
                    x2="127.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="146.5"
                    x2="146.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                    x1="162.5"
                    x2="162.5"
                    y1="300"
                    y2="285"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="165.5"
                    x2="165.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="185.5"
                    x2="185.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="204.5"
                    x2="204.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="223.5"
                    x2="223.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="243.5"
                    x2="243.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                    x1="245.5"
                    x2="245.5"
                    y1="300"
                    y2="285"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="262.5"
                    x2="262.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="281.5"
                    x2="281.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="301.5"
                    x2="301.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="320.5"
                    x2="320.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                    x1="331.5"
                    x2="331.5"
                    y1="300"
                    y2="285"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="339.5"
                    x2="339.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="359.5"
                    x2="359.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="378.5"
                    x2="378.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="397.5"
                    x2="397.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                    x1="414.5"
                    x2="414.5"
                    y1="300"
                    y2="285"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="417.5"
                    x2="417.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="436.5"
                    x2="436.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="455.5"
                    x2="455.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="475.5"
                    x2="475.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="494.5"
                    x2="494.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                    x1="500.5"
                    x2="500.5"
                    y1="300"
                    y2="285"
                  />
                </g>
                <g>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    transform="rotate(-30 0.5 285)"
                    x="0.5"
                    y="285"
                  >
                    Feb
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    transform="rotate(-30 77.5 285)"
                    x="77.5"
                    y="285"
                  >
                    Mar
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    transform="rotate(-30 162.5 285)"
                    x="162.5"
                    y="285"
                  >
                    Apr
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    transform="rotate(-30 245.5 285)"
                    x="245.5"
                    y="285"
                  >
                    May
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    transform="rotate(-30 331.5 285)"
                    x="331.5"
                    y="285"
                  >
                    Jun
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    transform="rotate(-30 414.5 285)"
                    x="414.5"
                    y="285"
                  >
                    Jul
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    transform="rotate(-30 500.5 285)"
                    x="500.5"
                    y="285"
                  >
                    Aug
                  </text>
                </g>
              </g>
              <g>
                <line
                  stroke="rgb(51,51,51)"
                  stroke-width="1"
                  x1="140.5"
                  x2="140.5"
                  y1="300"
                  y2="40"
                />
                <text
                  color="rgb(0,0,0)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="140.5"
                  y="40"
                >
                  Now
                </text>
              </g>
            </g>
            <g>
              <path
                d="M0.0,300.0 Q43,208 77.3,171.2 C100,148 132,140 163.0,128.2 C191,117 217,113 245.9,106.5 C276,100 301,97 331.5,93.4 C360,90 385,87 414.4,84.6 Q444,82 500.0,78.2"
                fill="none"
                stroke="rgb(153,153,153)"
                stroke-dasharray="3,5"
                stroke-width="1"
              />
              <path
                d="M0.0,300.0 Q34,111 77.3,42.5 C91,21 133,42 163.0,42.0"
                fill="none"
                stroke="rgb(0,51,153)"
                stroke-width="2"
              />
              <path
                d="M163.0,42.0 C192,42 217,42 245.9,41.6 C276,41 302,41 331.5,41.0 C360,41 385,41 414.4,40.6 Q444,40 500.0,40.0"
                fill="none"
                stroke="rgb(255,0,0)"
                stroke-width="2"
              />
            </g>
            <g>
              <path
                d="M0.0,280.0 Q50,280 77.3,279.9 C107,280 133,280 163.0,279.6 C192,279 217,279 245.9,279.4 C276,279 302,279 331.5,279.3 C360,279 385,279 414.4,279.2 Q444,279 500.0,279.0 L500,300 L0.0,300"
                fill="rgba(200,200,200,0.5)"
                stroke="none"
                stroke-width="2"
              />
            </g>
            <g>
              <g>
                <rect
                  fill="rgba(255,255,255,0.5)"
                  height="70"
                  width="100"
                  x="48"
                  y="70"
                />
                <text
                  alignment-baseline="hanging"
                  fill="rgb(51,51,51)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="50"
                  y="72"
                >
                  £98k (1y)
                </text>
                <text
                  alignment-baseline="hanging"
                  fill="rgb(51,51,51)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="50"
                  y="94"
                >
                  £109k (3y)
                </text>
                <text
                  alignment-baseline="hanging"
                  fill="rgb(51,51,51)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="50"
                  y="116"
                >
                  £85k (5y)
                </text>
                <g>
                  <path
                    d="M0,300 L51.14061934614897,221.48677147835343  L45.1,220.7 L54.1,217.0 L54.3,226.8 L51.1,221.5"
                    fill="none"
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                  />
                </g>
                <g>
                  <path
                    d="M331.49171270718233,300 L491.43984914284323,201.77635900273702  L480.6,195.0 L501.2,195.8 L492.6,214.6 L491.4,201.8"
                    fill="none"
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                  />
                </g>
                <g>
                  <path
                    d="M414.36464088397787,300 L685.6924619258672,224.26293160769637  L672.6,209.7 L702.5,219.6 L682.0,243.5 L685.7,224.3"
                    fill="none"
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                  />
                </g>
              </g>
              <g>
                <rect
                  fill="rgba(255,255,255,0.5)"
                  height="60"
                  width="200"
                  x="45"
                  y="8"
                />
                <text
                  alignment-baseline="hanging"
                  color="rgb(0,0,0)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="16"
                  x="65"
                  y="10"
                >
                  Balance
                </text>
                <line
                  stroke="rgb(0,51,153)"
                  stroke-width="2"
                  x1="50"
                  x2="74"
                  y1="40"
                  y2="40"
                />
                <text
                  alignment-baseline="middle"
                  fill="rgb(51,51,51)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="78"
                  y="40"
                >
                  Actual
                </text>
                <line
                  stroke="rgb(255,0,0)"
                  stroke-width="2"
                  x1="130"
                  x2="154"
                  y1="40"
                  y2="40"
                />
                <text
                  alignment-baseline="middle"
                  fill="rgb(51,51,51)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="158"
                  y="40"
                >
                  Predicted
                </text>
                <rect
                  fill="rgba(200,200,200,0.5)"
                  height="6"
                  width="24"
                  x="50"
                  y="54"
                />
                <text
                  alignment-baseline="middle"
                  fill="rgb(51,51,51)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="78"
                  y="57"
                >
                  Stocks
                </text>
              </g>
            </g>
          </svg>
          <span
            class="sc-jhAzac cBfGzl"
          >
            <span>
              Show all
            </span>
            <a
              class="sc-fBuWsC WXtfb"
            />
          </span>
        </div>
        <div
          class="sc-bRBYWo hltnta"
          height="300"
          width="500"
        >
          <svg
            data-testid="graph-svg"
            height="300"
            width="500"
          >
            <g>
              <g>
                <g>
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="282.5"
                    y2="282.5"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="229.5"
                    y2="229.5"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="176.5"
                    y2="176.5"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="123.5"
                    y2="123.5"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="70.5"
                    y2="70.5"
                  />
                </g>
                <g>
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="303.5"
                    y2="303.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="292.5"
                    y2="292.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="271.5"
                    y2="271.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="261.5"
                    y2="261.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="250.5"
                    y2="250.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="239.5"
                    y2="239.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="218.5"
                    y2="218.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="208.5"
                    y2="208.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="197.5"
                    y2="197.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="187.5"
                    y2="187.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="165.5"
                    y2="165.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="155.5"
                    y2="155.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="144.5"
                    y2="144.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="134.5"
                    y2="134.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="112.5"
                    y2="112.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="102.5"
                    y2="102.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="91.5"
                    y2="91.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="81.5"
                    y2="81.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="60.5"
                    y2="60.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="49.5"
                    y2="49.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="38.5"
                    y2="38.5"
                  />
                </g>
                <g>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    text-anchor="start"
                    x="0"
                    y="280.5"
                  >
                    £0
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    text-anchor="start"
                    x="0"
                    y="227.5"
                  >
                    £5
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    text-anchor="start"
                    x="0"
                    y="174.5"
                  >
                    £10
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    text-anchor="start"
                    x="0"
                    y="121.5"
                  >
                    £15
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    text-anchor="start"
                    x="0"
                    y="68.5"
                  >
                    £20
                  </text>
                </g>
                <g>
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="-8.5"
                    x2="-8.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="0.5"
                    x1="0.5"
                    x2="0.5"
                    y1="285"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="11.5"
                    x2="11.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="30.5"
                    x2="30.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="49.5"
                    x2="49.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="69.5"
                    x2="69.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="0.5"
                    x1="77.5"
                    x2="77.5"
                    y1="285"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="88.5"
                    x2="88.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="107.5"
                    x2="107.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="127.5"
                    x2="127.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="146.5"
                    x2="146.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="0.5"
                    x1="162.5"
                    x2="162.5"
                    y1="285"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="165.5"
                    x2="165.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="185.5"
                    x2="185.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="204.5"
                    x2="204.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="223.5"
                    x2="223.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="243.5"
                    x2="243.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="0.5"
                    x1="245.5"
                    x2="245.5"
                    y1="285"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="262.5"
                    x2="262.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="281.5"
                    x2="281.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="301.5"
                    x2="301.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="320.5"
                    x2="320.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="0.5"
                    x1="331.5"
                    x2="331.5"
                    y1="285"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="339.5"
                    x2="339.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="359.5"
                    x2="359.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="378.5"
                    x2="378.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="397.5"
                    x2="397.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="0.5"
                    x1="414.5"
                    x2="414.5"
                    y1="285"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="417.5"
                    x2="417.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="436.5"
                    x2="436.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="455.5"
                    x2="455.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="475.5"
                    x2="475.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="0.5"
                    x1="494.5"
                    x2="494.5"
                    y1="295"
                    y2="0"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="0.5"
                    x1="500.5"
                    x2="500.5"
                    y1="285"
                    y2="0"
                  />
                </g>
                <g>
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="-8.5"
                    x2="-8.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                    x1="0.5"
                    x2="0.5"
                    y1="300"
                    y2="285"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="11.5"
                    x2="11.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="30.5"
                    x2="30.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="49.5"
                    x2="49.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="69.5"
                    x2="69.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                    x1="77.5"
                    x2="77.5"
                    y1="300"
                    y2="285"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="88.5"
                    x2="88.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="107.5"
                    x2="107.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="127.5"
                    x2="127.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="146.5"
                    x2="146.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                    x1="162.5"
                    x2="162.5"
                    y1="300"
                    y2="285"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="165.5"
                    x2="165.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="185.5"
                    x2="185.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="204.5"
                    x2="204.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="223.5"
                    x2="223.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="243.5"
                    x2="243.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                    x1="245.5"
                    x2="245.5"
                    y1="300"
                    y2="285"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="262.5"
                    x2="262.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="281.5"
                    x2="281.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="301.5"
                    x2="301.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="320.5"
                    x2="320.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                    x1="331.5"
                    x2="331.5"
                    y1="300"
                    y2="285"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="339.5"
                    x2="339.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="359.5"
                    x2="359.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="378.5"
                    x2="378.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="397.5"
                    x2="397.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                    x1="414.5"
                    x2="414.5"
                    y1="300"
                    y2="285"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="417.5"
                    x2="417.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="436.5"
                    x2="436.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="455.5"
                    x2="455.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="475.5"
                    x2="475.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(0,0,0)"
                    stroke-width="1"
                    x1="494.5"
                    x2="494.5"
                    y1="300"
                    y2="295"
                  />
                  <line
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                    x1="500.5"
                    x2="500.5"
                    y1="300"
                    y2="285"
                  />
                </g>
                <g>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    transform="rotate(-30 0.5 285)"
                    x="0.5"
                    y="285"
                  >
                    Feb
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    transform="rotate(-30 77.5 285)"
                    x="77.5"
                    y="285"
                  >
                    Mar
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    transform="rotate(-30 162.5 285)"
                    x="162.5"
                    y="285"
                  >
                    Apr
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    transform="rotate(-30 245.5 285)"
                    x="245.5"
                    y="285"
                  >
                    May
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    transform="rotate(-30 331.5 285)"
                    x="331.5"
                    y="285"
                  >
                    Jun
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    transform="rotate(-30 414.5 285)"
                    x="414.5"
                    y="285"
                  >
                    Jul
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    transform="rotate(-30 500.5 285)"
                    x="500.5"
                    y="285"
                  >
                    Aug
                  </text>
                </g>
              </g>
              <g>
                <line
                  stroke="rgb(51,51,51)"
                  stroke-width="1"
                  x1="140.5"
                  x2="140.5"
                  y1="300"
                  y2="40"
                />
                <text
                  color="rgb(0,0,0)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="140.5"
                  y="40"
                >
                  Now
                </text>
              </g>
            </g>
            <g>
              <g>
                <path
                  d="M0,282.2294548413344 L4.472736235067494e-15,209.18412882273725  L-4.5,211.4 L0.0,204.8 L4.5,211.4 L0.0,209.2"
                  fill="rgb(0,204,51)"
                  stroke="rgb(0,204,51)"
                  stroke-width="0.9694323144104803"
                />
              </g>
              <g>
                <path
                  d="M77.34806629834254,282.2294548413344 L77.34806629834254,290.1  L84.8,286.5 L77.3,297.3 L69.8,286.5 L77.3,290.1"
                  fill="rgb(204,51,0)"
                  stroke="rgb(204,51,0)"
                  stroke-width="3"
                />
              </g>
              <g>
                <path
                  d="M162.98342541436463,282.2294548413344 L162.98342541436463,208.05372532786623  L158.5,210.2 L163.0,203.7 L167.5,210.2 L163.0,208.1"
                  fill="rgb(0,204,51)"
                  stroke="rgb(0,204,51)"
                  stroke-width="0.9838427947598254"
                />
              </g>
              <g>
                <path
                  d="M245.85635359116023,282.2294548413344 L245.85635359116023,126.972965559389  L239.8,129.9 L245.9,121.1 L251.9,129.9 L245.9,127.0"
                  fill="rgb(0,204,51)"
                  stroke="rgb(0,204,51)"
                  stroke-width="2.017467248908297"
                />
              </g>
              <g>
                <path
                  d="M331.49171270718233,282.2294548413344 L331.49171270718233,80.72918622375556  L324.6,84.1 L331.5,74.1 L338.4,84.1 L331.5,80.7"
                  fill="rgb(0,204,51)"
                  stroke="rgb(0,204,51)"
                  stroke-width="2.606986899563319"
                />
              </g>
              <g>
                <path
                  d="M414.36464088397787,282.2294548413344 L414.36464088397787,132.11116326334826  L408.4,135.0 L414.4,126.4 L420.3,135.0 L414.4,132.1"
                  fill="rgb(0,204,51)"
                  stroke="rgb(0,204,51)"
                  stroke-width="1.9519650655021832"
                />
              </g>
              <g>
                <path
                  d="M500,282.2294548413344 L500,49.900000000000006  L492.5,53.5 L500.0,42.7 L507.5,53.5 L500.0,49.9"
                  fill="rgb(0,204,51)"
                  stroke="rgb(0,204,51)"
                  stroke-width="3"
                />
              </g>
            </g>
            <g>
              <path
                d="M0.0,149.0 Q54,56 77.3,63.5 C111,75 124,176 163.0,203.0 C183,217 220,174 245.9,180.7 C279,190 298,236 331.5,249.4 C357,260 385,249 414.4,249.4 Q444,249 500.0,249.4"
                fill="none"
                stroke="rgb(0,51,153)"
                stroke-width="2"
              />
              <path
                d="M0.0,149.0 Q49,108 77.3,106.2 C106,104 132,131 163.0,138.5 C191,146 217,144 245.9,149.0 C276,155 301,163 331.5,169.1 C360,175 385,177 414.4,182.5 Q444,188 500.0,199.2"
                fill="none"
                stroke="rgb(153,153,153)"
                stroke-dasharray="3,5"
                stroke-width="1"
              />
            </g>
            <g>
              <g>
                <rect
                  fill="rgba(255,255,255,0.5)"
                  height="60"
                  width="200"
                  x="45"
                  y="8"
                />
                <text
                  alignment-baseline="hanging"
                  color="rgb(0,0,0)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="16"
                  x="65"
                  y="10"
                >
                  Cash flow
                </text>
                <line
                  stroke="rgb(0,51,153)"
                  stroke-width="2"
                  x1="50"
                  x2="74"
                  y1="40"
                  y2="40"
                />
                <text
                  alignment-baseline="middle"
                  fill="rgb(51,51,51)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="78"
                  y="40"
                >
                  Spending
                </text>
                <rect
                  fill="rgba(255,255,255,0.5)"
                  height="260"
                  width="49016.57455366278"
                  x="-48516.57455366278"
                  y="40"
                />
              </g>
            </g>
          </svg>
        </div>
      </div>
    `);

    clock.restore();
  });
});
