import reducer, { initialState, State } from './analysis';
import { requested, received, blockRequested, blockReceived } from '~client/actions/analysis';
import { loggedOut } from '~client/actions/login';
import { Period, Grouping } from '~client/constants/analysis';
import { testState } from '~client/test-data/state';
import { Page } from '~client/types';

describe('Analysis reducer', () => {
  describe.each`
    description      | action
    ${'Null action'} | ${null}
    ${'LOGGED_OUT'}  | ${loggedOut()}
  `('$description', ({ action }) => {
    it('should return the initial state', () => {
      expect.assertions(1);
      expect(reducer(undefined, action)).toStrictEqual(initialState);
    });
  });

  describe('ANALYSIS_REQUESTED', () => {
    it('should set up the state for loading new data', () => {
      expect.assertions(20);

      const state: State = {
        ...testState.analysis,
        loading: false,
        period: Period.year,
        grouping: Grouping.category,
        page: 3,
      };

      const withPeriod = reducer(state, requested({ period: Period.month }));
      expect(withPeriod.loading).toBe(true);
      expect(withPeriod.loadingDeep).toBe(false);
      expect(withPeriod.period).toBe('month');
      expect(withPeriod.grouping).toBe('category');
      expect(withPeriod.page).toBe(0);

      const withGrouping = reducer(state, requested({ grouping: Grouping.shop }));
      expect(withGrouping.loading).toBe(true);
      expect(withGrouping.loadingDeep).toBe(false);
      expect(withGrouping.period).toBe('year');
      expect(withGrouping.grouping).toBe('shop');
      expect(withGrouping.page).toBe(0);

      const withPage = reducer(state, requested({ page: 1 }));
      expect(withPage.loading).toBe(true);
      expect(withPage.loadingDeep).toBe(false);
      expect(withPage.period).toBe('year');
      expect(withPage.grouping).toBe('category');
      expect(withPage.page).toBe(1);

      const withNothing = reducer(state, requested());
      expect(withNothing.loading).toBe(true);
      expect(withNothing.loadingDeep).toBe(false);
      expect(withNothing.period).toBe('year');
      expect(withNothing.grouping).toBe('category');
      expect(withNothing.page).toBe(0);
    });
  });

  describe('ANALYSIS_RECEIVED', () => {
    const state: State = {
      ...testState.analysis,
      loading: true,
      period: Period.year,
      grouping: Grouping.category,
      page: 0,
      timeline: null,
    };

    it('should update data in state', () => {
      expect.assertions(7);

      const action = received({
        data: {
          timeline: [
            [72500, 1035, 2779, 1745],
            [3724, 3340, 3299],
          ],
          cost: [
            [
              Page.bills,
              [
                ['EDF Energy', -6110],
                ['Water', 44272],
              ],
            ],
            [
              Page.food,
              [
                ['Baking', 880],
                ['Dairy', 4614],
              ],
            ],
            [
              Page.general,
              [
                ['Furniture', 8399],
                ['Mail', 402],
              ],
            ],
          ],
          saved: 996899,
          description: '2019',
        },
      });

      const result = reducer(state, action);

      expect(result.loading).toBe(false);
      expect(result.loadingDeep).toBe(false);

      expect(result.timeline).toStrictEqual([
        [72500, 1035, 2779, 1745],
        [3724, 3340, 3299],
      ]);

      expect(result.costDeep).toBeNull();

      expect(result.cost).toStrictEqual([
        [
          Page.bills,
          [
            ['EDF Energy', -6110],
            ['Water', 44272],
          ],
        ],
        [
          Page.food,
          [
            ['Baking', 880],
            ['Dairy', 4614],
          ],
        ],
        [
          Page.general,
          [
            ['Furniture', 8399],
            ['Mail', 402],
          ],
        ],
      ]);

      expect(result.saved).toBe(996899);

      expect(result.description).toBe('2019');
    });

    it('should not do anything if the response was not defined', () => {
      expect.assertions(1);

      const action = received(undefined);

      expect(reducer(state, action)).toBe(state);
    });
  });

  describe('ANALYSIS_BLOCK_REQUESTED', () => {
    describe('while on main view', () => {
      it('should set state up for loading deep view', () => {
        expect.assertions(2);
        const state: State = { ...testState.analysis };

        const action = blockRequested(Page.food);

        const result = reducer(state, action);

        expect(result.loading).toBe(true);
        expect(result.loadingDeep).toBe(true);
      });

      it("shouldn't do anything on bills or saved block", () => {
        expect.assertions(2);
        const state: State = { ...testState.analysis };

        expect(reducer(state, blockRequested(Page.bills))).toStrictEqual(
          expect.objectContaining({
            loading: false,
            loadingDeep: false,
          }),
        );
        expect(reducer(state, blockRequested('saved' as const))).toStrictEqual(
          expect.objectContaining({
            loading: false,
            loadingDeep: false,
          }),
        );
      });
    });

    describe('while on deep view', () => {
      it('should reset the deep data', () => {
        expect.assertions(3);
        const state: State = {
          ...testState.analysis,
          costDeep: [['foo1_deep', [['foo1_deep_bar1_deep', 1003]]]],
        };

        const action = blockRequested('Fish');

        const result = reducer(state, action);

        expect(result.costDeep).toBeNull();
        expect(result.loading).toBe(false);
        expect(result.loadingDeep).toBe(false);
      });
    });
  });

  describe('ANALYSIS_BLOCK_RECEIVED', () => {
    it('should update deep-block data in state', () => {
      expect.assertions(7);
      const state: State = {
        ...testState.analysis,
        loading: false,
        loadingDeep: true,
        cost: [],
        saved: 230,
        description: 'some description',
        period: Period.year,
        grouping: Grouping.category,
        page: 0,
        timeline: [[1, 2, 3]],
      };

      const action = blockReceived({
        data: {
          items: [
            ['Bread', [['Bread', 317]]],
            [
              'Fish',
              [
                ['Cod Fillets', 299],
                ['Salmon', 585],
              ],
            ],
          ],
        },
      });

      const result = reducer(state, action);

      expect(result.loading).toBe(false);
      expect(result.loadingDeep).toBe(false);

      expect(result.timeline).toBe(state.timeline);

      expect(result.costDeep).toStrictEqual([
        ['Bread', [['Bread', 317]]],
        [
          'Fish',
          [
            ['Cod Fillets', 299],
            ['Salmon', 585],
          ],
        ],
      ]);

      expect(result.cost).toBe(state.cost);

      expect(result.saved).toBe(state.saved);

      expect(result.description).toBe(state.description);
    });
  });
});
