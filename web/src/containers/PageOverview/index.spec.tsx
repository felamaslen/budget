/* eslint-disable max-len */
import sinon from 'sinon';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import PageOverview from '.';
import '~client/mocks/match-media';
import state from '~client/test-data/state';
import { mockRandom } from '~client/mocks/random';
import { State } from '~client/reducers';

describe('<PageOverview />', () => {
  const mockStore = configureStore<State>();
  const now = new Date('2020-04-20T16:29Z');
  const getContainer = (): RenderResult =>
    render(
      <MemoryRouter>
        <Provider store={mockStore({ ...state, now })}>
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
            class="sc-bxivhb sc-EHOje gvRYDM"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Month
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje cVYjGo"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Stocks
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje cVYjGo"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Bills
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje cVYjGo"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Food
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje cVYjGo"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              General
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje cVYjGo"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Holiday
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje cVYjGo"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Social
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje iCvKyX"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Income
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje jnNlFj"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Out
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje ggSTWr"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Net
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje ddwoau"
          >
            <span
              class="sc-bZQynM jdQAmB"
            >
              Predicted
            </span>
          </div>
          <div
            class="sc-bxivhb sc-EHOje cYCNYR"
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
              style="background-color: rgb(170, 183, 189);"
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
              style="background-color: rgb(128, 196, 189);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.1
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(213, 191, 110);"
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
              style="background-color: rgb(209, 99, 99);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £12.60
              </span>
            </div>
            <div
              class="sc-bxivhb JzZId"
              style="background-color: rgb(210, 242, 214);"
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
              style="background-color: rgb(146, 163, 171);"
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
              style="background-color: rgb(161, 208, 163);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.1
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(55, 123, 176);"
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
              style="background-color: rgb(209, 185, 97);"
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
              style="background-color: rgb(230, 248, 232);"
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
            class="sc-htpNat kjPaM"
          >
            <div
              class="sc-bxivhb jfSVUT"
            >
              <span>
                Mar-18
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(95, 119, 130);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £1k
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(219, 142, 142);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £4.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(143, 199, 146);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.2
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(128, 171, 205);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.1
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(117, 191, 183);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.9
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(191, 158, 36);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £1.34
              </span>
            </div>
            <div
              class="sc-bxivhb hLBMqG"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £15.00
              </span>
            </div>
            <div
              class="sc-bxivhb fPGNYZ"
              style="background-color: rgb(223, 146, 146);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £6.59
              </span>
            </div>
            <div
              class="sc-bxivhb JzZId"
              style="background-color: rgb(203, 240, 208);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £8.41
              </span>
            </div>
            <div
              class="sc-bxivhb fSxTEn"
              style="background-color: rgb(36, 191, 55);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £13k
              </span>
            </div>
            <div
              class="sc-bxivhb kHsobB"
              style="background-color: rgb(58, 197, 75);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £10.4k
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
                Apr-18
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(84, 110, 122);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £1k
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(204, 94, 94);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £6.50
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(146, 200, 148);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.2
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(105, 156, 196);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.3
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(127, 196, 189);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.1
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(223, 207, 146);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.1
              </span>
            </div>
            <div
              class="sc-bxivhb hLBMqG"
              style="background-color: rgb(54, 196, 72);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £25.00
              </span>
            </div>
            <div
              class="sc-bxivhb fPGNYZ"
              style="background-color: rgb(221, 140, 140);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £7.27
              </span>
            </div>
            <div
              class="sc-bxivhb JzZId"
              style="background-color: rgb(146, 223, 156);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £17.73
              </span>
            </div>
            <div
              class="sc-bxivhb fSxTEn"
              style="background-color: rgb(58, 197, 75);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £10.4k
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
                May-18
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb hLBMqG"
              style="background-color: rgb(91, 207, 105);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £23.00
              </span>
            </div>
            <div
              class="sc-bxivhb fPGNYZ"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb JzZId"
              style="background-color: rgb(76, 203, 92);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £23.00
              </span>
            </div>
            <div
              class="sc-bxivhb fSxTEn"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                (£1k)
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
                Jun-18
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb hLBMqG"
              style="background-color: rgb(189, 236, 195);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £18.00
              </span>
            </div>
            <div
              class="sc-bxivhb fPGNYZ"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb JzZId"
              style="background-color: rgb(144, 222, 153);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £18.00
              </span>
            </div>
            <div
              class="sc-bxivhb fSxTEn"
              style="background-color: rgb(165, 229, 173);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £18.00
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
                Jul-18
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb bTHCEP"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb hLBMqG"
              style="background-color: rgb(36, 191, 55);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £26.00
              </span>
            </div>
            <div
              class="sc-bxivhb fPGNYZ"
              style="background-color: rgb(255, 255, 255);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £0.00
              </span>
            </div>
            <div
              class="sc-bxivhb JzZId"
              style="background-color: rgb(36, 191, 55);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £26.00
              </span>
            </div>
            <div
              class="sc-bxivhb fSxTEn"
              style="background-color: rgb(145, 223, 155);"
            >
              <span
                class="sc-gzVnrw DaTdd"
              >
                £26.00
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
        class="sc-hzDkRC sc-hmzhuo fvLzdg"
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
                    y1="281.5"
                    y2="281.5"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="189.5"
                    y2="189.5"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="96.5"
                    y2="96.5"
                  />
                </g>
                <g>
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="318.5"
                    y2="318.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="299.5"
                    y2="299.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="262.5"
                    y2="262.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="244.5"
                    y2="244.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="225.5"
                    y2="225.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="207.5"
                    y2="207.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="170.5"
                    y2="170.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="152.5"
                    y2="152.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="133.5"
                    y2="133.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="115.5"
                    y2="115.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="78.5"
                    y2="78.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="59.5"
                    y2="59.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="41.5"
                    y2="41.5"
                  />
                </g>
                <g>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    text-anchor="start"
                    x="0"
                    y="279.5"
                  >
                    £0
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    text-anchor="start"
                    x="0"
                    y="187.5"
                  >
                    £5k
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    text-anchor="start"
                    x="0"
                    y="94.5"
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
                  x1="2237.5"
                  x2="2237.5"
                  y1="300"
                  y2="40"
                />
                <text
                  color="rgb(0,0,0)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="2237.5"
                  y="40"
                >
                  Now
                </text>
              </g>
            </g>
            <g>
              <path
                d="M0,281.28500936581725 Q36,89 77.3,40.0 C93,21 144,61 163.0,87.8 C203,145 204,232 245.9,279.5 C263,299 302,279 331.5,279.5 C360,279 385,279 414.4,279.5 Q444,279 500.0,279.5"
                fill="none"
                stroke="#00348a"
                stroke-dasharray="3,5"
                stroke-width="1"
              />
            </g>
            <g>
              <path
                d="M0,281.28500936581725 Q36,90 77.3,41.8 C93,23 144,63 163.0,89.6 C203,147 204,234 245.9,281.3 C263,301 302,281 331.5,281.3 C360,281 385,281 414.4,281.3 Q444,281 500.0,281.3 L500.0,281.3 Q444,281 414.4,281.3 C385,281 360,281 331.5,281.3 C302,281 263,301 245.9,281.3 C204,234 203,147 163.0,89.6 C144,63 93,23 77.3,41.8 Q36,90 0.0,281.3"
                fill="rgba(47,123,211,0.5)"
                stroke="none"
                stroke-width="2"
              />
            </g>
            <g>
              <path
                d="M0,281.28500936581725 Q36,90 77.3,41.8 C93,23 144,63 163.0,89.6 C203,147 204,234 245.9,281.3 C263,301 302,281 331.5,281.3 C360,281 385,281 414.4,281.3 Q444,281 500.0,281.3"
                fill="none"
                stroke="rgb(0,51,153)"
                stroke-width="2"
              />
            </g>
            <g>
              <path
                d="M0,281.28500936581725 Q50,281 77.3,281.3 C107,281 133,281 163.0,281.0 C192,281 217,278 245.9,280.9 C276,284 301,297 331.5,300.0 C360,303 385,300 414.4,300.0 Q444,300 500.0,300.0 L500.0,281.3 Q444,281 414.4,281.3 C385,281 360,285 331.5,281.3 C301,278 276,266 245.9,262.2 C217,259 192,262 163.0,262.3 C133,262 107,262 77.3,262.6 Q50,263 0.0,262.7"
                fill="rgba(200,200,200,0.3)"
                stroke="none"
                stroke-width="2"
              />
            </g>
            <g>
              <path
                d="M0,262.6954506167432 Q50,263 77.3,262.6 C107,262 133,262 163.0,262.3 C192,262 217,259 245.9,262.2 C276,266 301,278 331.5,281.3 C360,285 385,281 414.4,281.3 Q444,281 500.0,281.3 L500,300 L0,300"
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
                  y="100"
                />
                <text
                  alignment-baseline="hanging"
                  fill="rgb(51,51,51)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="50"
                  y="100"
                >
                  −£NaN (1y)
                </text>
                <text
                  alignment-baseline="hanging"
                  fill="rgb(51,51,51)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="50"
                  y="122"
                >
                  −£NaN (3y)
                </text>
                <text
                  alignment-baseline="hanging"
                  fill="rgb(51,51,51)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="50"
                  y="144"
                >
                  −£NaN (5y)
                </text>
                <g>
                  <path
                    d="M245.85635359116023,281.28500936581725 LNaN,NaN  LNaN,NaN LNaN,NaN LNaN,NaN LNaN,NaN"
                    fill="none"
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                  />
                </g>
                <g>
                  <path
                    d="M0,281.28500936581725 LNaN,NaN  LNaN,NaN LNaN,NaN LNaN,NaN LNaN,NaN"
                    fill="none"
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                  />
                </g>
                <g>
                  <path
                    d="M77.34806629834254,41.81575750259327 LNaN,NaN  LNaN,NaN LNaN,NaN LNaN,NaN LNaN,NaN"
                    fill="none"
                    stroke="rgb(51,51,51)"
                    stroke-width="1"
                  />
                </g>
              </g>
              <g>
                <rect
                  fill="rgba(255,255,255,0.5)"
                  height="80"
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
                  y="53"
                />
                <text
                  alignment-baseline="middle"
                  fill="rgb(51,51,51)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="78"
                  y="56"
                >
                  Stocks
                </text>
                <rect
                  fill="rgba(200,200,200,0.3)"
                  height="6"
                  width="24"
                  x="130"
                  y="53"
                />
                <text
                  alignment-baseline="middle"
                  fill="rgb(51,51,51)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="158"
                  y="56"
                >
                  Locked cash
                </text>
                <rect
                  fill="rgba(47,123,211,0.5)"
                  height="6"
                  width="24"
                  x="130"
                  y="69"
                />
                <text
                  alignment-baseline="middle"
                  fill="rgb(51,51,51)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="158"
                  y="72"
                >
                  Pension
                </text>
                <line
                  stroke="#00348a"
                  stroke-dasharray="3,4"
                  stroke-width="1"
                  x1="50"
                  x2="74"
                  y1="72.5"
                  y2="72.5"
                />
                <text
                  alignment-baseline="middle"
                  fill="rgb(51,51,51)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="78"
                  y="72"
                >
                  Options
                </text>
              </g>
            </g>
          </svg>
          <span
            class="sc-cJSrbW iKWsas"
          >
            <span>
              Show all
            </span>
            <a
              class="sc-ksYbfQ eijAEV"
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
                    y1="284.5"
                    y2="284.5"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="190.5"
                    y2="190.5"
                  />
                  <line
                    stroke="rgb(153,153,153)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="96.5"
                    y2="96.5"
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
                    y1="265.5"
                    y2="265.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="246.5"
                    y2="246.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="227.5"
                    y2="227.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="209.5"
                    y2="209.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="171.5"
                    y2="171.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="152.5"
                    y2="152.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="133.5"
                    y2="133.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="115.5"
                    y2="115.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="77.5"
                    y2="77.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="58.5"
                    y2="58.5"
                  />
                  <line
                    stroke="rgb(238,238,238)"
                    stroke-width="1"
                    x1="0"
                    x2="500"
                    y1="40.5"
                    y2="40.5"
                  />
                </g>
                <g>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    text-anchor="start"
                    x="0"
                    y="282.5"
                  >
                    £0
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    text-anchor="start"
                    x="0"
                    y="188.5"
                  >
                    £10
                  </text>
                  <text
                    alignment-baseline="baseline"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="11"
                    text-anchor="start"
                    x="0"
                    y="94.5"
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
                  x1="2237.5"
                  x2="2237.5"
                  y1="300"
                  y2="40"
                />
                <text
                  color="rgb(0,0,0)"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="11"
                  x="2237.5"
                  y="40"
                >
                  Now
                </text>
              </g>
            </g>
            <g>
              <g>
                <path
                  d="M0,284.21965317919074 L3.952230628091076e-15,219.67482881280569  L-4.3,221.8 L0.0,215.5 L4.3,221.8 L0.0,219.7"
                  fill="rgb(0,204,51)"
                  stroke="rgb(0,204,51)"
                  stroke-width="0.8538461538461538"
                />
              </g>
              <g>
                <path
                  d="M77.34806629834254,284.21965317919074 L77.34806629834254,290.1  L84.8,286.5 L77.3,297.3 L69.8,286.5 L77.3,290.1"
                  fill="rgb(204,51,0)"
                  stroke="rgb(204,51,0)"
                  stroke-width="3"
                />
              </g>
              <g>
                <path
                  d="M162.98342541436463,284.21965317919074 L162.98342541436463,210.45587305469098  L158.5,212.6 L163.0,206.1 L167.4,212.6 L163.0,210.5"
                  fill="rgb(0,204,51)"
                  stroke="rgb(0,204,51)"
                  stroke-width="0.9703846153846154"
                />
              </g>
              <g>
                <path
                  d="M245.85635359116023,284.21965317919074 L245.85635359116023,125.3859050689195  L239.8,128.3 L245.9,119.5 L251.9,128.3 L245.9,125.4"
                  fill="rgb(0,204,51)"
                  stroke="rgb(0,204,51)"
                  stroke-width="2.045769230769231"
                />
              </g>
              <g>
                <path
                  d="M331.49171270718233,284.21965317919074 L331.49171270718233,77.28303690529125  L324.5,80.6 L331.5,70.6 L338.5,80.6 L331.5,77.3"
                  fill="rgb(0,204,51)"
                  stroke="rgb(0,204,51)"
                  stroke-width="2.6538461538461537"
                />
              </g>
              <g>
                <path
                  d="M414.36464088397787,284.21965317919074 L414.36464088397787,122.92143174744331  L408.2,125.9 L414.4,117.0 L420.5,125.9 L414.4,122.9"
                  fill="rgb(0,204,51)"
                  stroke="rgb(0,204,51)"
                  stroke-width="2.0769230769230766"
                />
              </g>
              <g>
                <path
                  d="M500,284.21965317919074 L500,49.900000000000006  L492.5,53.5 L500.0,42.7 L507.5,53.5 L500.0,49.9"
                  fill="rgb(0,204,51)"
                  stroke="rgb(0,204,51)"
                  stroke-width="3"
                />
              </g>
            </g>
            <g>
              <path
                d="M0,165.8670520231214 Q54,82 77.3,90.0 C111,102 124,193 163.0,222.3 C183,238 220,207 245.9,215.9 C279,228 298,271 331.5,284.2 C357,295 385,284 414.4,284.2 Q444,284 500.0,284.2"
                fill="none"
                stroke="rgb(0,51,153)"
                stroke-width="2"
              />
              <path
                d="M0,165.8670520231214 Q50,129 77.3,127.9 C107,127 132,151 163.0,159.4 C191,167 217,167 245.9,173.5 C276,180 301,189 331.5,195.7 C360,202 386,205 414.4,210.4 Q444,217 500.0,230.1"
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
