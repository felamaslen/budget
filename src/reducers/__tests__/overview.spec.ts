import { reducer, initialState, State } from '~/reducers/overview';
import { Overview } from '~/types/overview';
import { SocketAction } from '~/types/actions';
import { OVERVIEW_READ } from '~/constants/actions.rt';

test('action: OVERVIEW_READ inserts data into state', () => {
  expect.assertions(1);
  const action: SocketAction<Overview<string>> = {
    type: OVERVIEW_READ,
    __FROM_SOCKET__: true,
    payload: {
      startDate: '2014-09-30',
      viewStartDate: '2018-01-31',
      netWorth: [1, 2, 3, 7, 17, 8, 13, 2013, 193, -32, 1302, 142, 9, 132],
      funds: [
        {
          value: 706735.286959267,
          cost: 710000,
        },
        {
          value: 687456.59844844,
          cost: 710000,
        },
        {
          value: 710277.192934586,
          cost: 710000,
        },
        {
          value: 803412.732942871,
          cost: 800000,
        },
        {
          value: 930085.888205582,
          cost: 900000,
        },
        {
          value: 988657.403438599,
          cost: 945000,
        },
        {
          value: 305728.022753906,
          cost: 300000,
        },
        {
          value: 718579.52956543,
          cost: 699924,
        },
        {
          value: 701433.817077637,
          cost: 699924,
        },
        {
          value: 707230.076135254,
          cost: 699924,
        },
        {
          value: 712347.481835938,
          cost: 699924,
        },
        {
          value: 705250.687548828,
          cost: 699924,
        },
        {
          value: 810352.980918884,
          cost: 799924,
        },
        {
          value: 903605.650028992,
          cost: 896451,
        },
        {
          value: 1020063.20755844,
          cost: 991451,
        },
        {
          value: 1004471.44280014,
          cost: 991451,
        },
        {
          value: 984338.100311279,
          cost: 991451,
        },
        {
          value: 1134191.39990623,
          cost: 1130939,
        },
        {
          value: 1536300.5176906,
          cost: 1500870,
        },
        {
          value: 1647705.87413846,
          cost: 1590870,
        },
        {
          value: 1647738.29373885,
          cost: 1621008,
        },
        {
          value: 1799002.14999936,
          cost: 1760848,
        },
        {
          value: 1953258.94591226,
          cost: 1870535,
        },
        {
          value: 1683350.98085956,
          cost: 1634438,
        },
        {
          value: 1852331.03575046,
          cost: 1934130,
        },
        {
          value: 1848762.62221378,
          cost: 1934130,
        },
        {
          value: 2009112.1808291,
          cost: 2223968,
        },
        {
          value: 2756681.26529546,
          cost: 2864010,
        },
        {
          value: 2839901.75959728,
          cost: 2864010,
        },
        {
          value: 2954114.94477648,
          cost: 2864010,
        },
        {
          value: 3749981.01648232,
          cost: 3563936,
        },
        {
          value: 3643727.25280604,
          cost: 3713936,
        },
        {
          value: 3848262.1384269,
          cost: 3713936,
        },
        {
          value: 4248143.62058372,
          cost: 3903052,
        },
        {
          value: 3999636.19377987,
          cost: 3903052,
        },
        {
          value: 5637313.79467775,
          cost: 5521536,
        },
        {
          value: 5565704.20168666,
          cost: 5521536,
        },
        {
          value: 5711738.4721542,
          cost: 5521536,
        },
      ],
      income: [
        3743493,
        709178,
        235998,
        206117,
        315124,
        547183,
        482767,
        471773,
        468103,
        468103,
        468103,
        462273,
      ],
      bills: [
        102126,
        118057,
        568421,
        86973,
        144243,
        214868,
        212450,
        203250,
        209450,
        210250,
        209450,
        209450,
      ],
      food: [10792, 27550, 28068, 42015, 27227, 35027, 37551, 38718, 21524, 32293, 34607, 3275],
      general: [
        24015,
        67490,
        160600,
        361042,
        119464,
        45887,
        46334,
        58119,
        29869,
        84270,
        78914,
        14940,
      ],
      holiday: [86760, 0, 0, 0, 0, 0, 0, 136713, 72802, 0, 0, 95232],
      social: [20597, 3475, 13055, 22356, 10459, 12400, 9915, 11865, 13518, 9583, 7160, 8480],
    },
  };

  const result: State = reducer(initialState, action);

  expect(result).toStrictEqual({
    startDate: new Date('2014-09-30'),
    viewStartDate: new Date('2018-01-31'),
    futureMonths: 12,
    netWorth: (action.payload || {}).netWorth,
    funds: (action.payload || {}).funds,
    income: (action.payload || {}).income,
    bills: (action.payload || {}).bills,
    food: (action.payload || {}).food,
    general: (action.payload || {}).general,
    holiday: (action.payload || {}).holiday,
    social: (action.payload || {}).social,
  });
});
