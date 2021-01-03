import getUnixTime from 'date-fns/getUnixTime';

import { State } from '~client/reducers/funds';
import type { FundNative } from '~client/types';

export const testRows: FundNative[] = [
  {
    id: 10,
    item: 'some fund 1',
    transactions: [
      {
        price: 428,
        units: 934,
        fees: 148,
        taxes: 100,
        date: new Date('2017-05-09'),
      },
    ],
    allocationTarget: 0,
  },
  {
    id: 3,
    item: 'some fund 2',
    transactions: [
      {
        units: 450,
        price: 100,
        fees: 0,
        taxes: 0,
        date: new Date('2017-03-03'),
      },
      {
        units: -450,
        price: 112,
        fees: 20,
        taxes: 80,
        date: new Date('2017-04-27'),
      },
    ],
    allocationTarget: 0,
  },
  {
    id: 1,
    item: 'some fund 3',
    transactions: [
      {
        units: 1117.87,
        price: 80.510256,
        fees: 0,
        taxes: 0,
        date: new Date('2017-01-11'),
      },
      {
        units: -1117.87,
        price: 72.24453648,
        fees: 0,
        taxes: 0,
        date: new Date('2017-04-27'),
      },
    ],
    allocationTarget: 0,
  },
  {
    id: 5,
    item: 'test fund 4',
    transactions: [
      {
        units: 1499.7,
        price: 133.36,
        fees: 0,
        taxes: 0,
        date: new Date('2016-09-21'),
      },
      {
        units: -1499.7,
        price: 177.1167567,
        fees: 0,
        taxes: 0,
        date: new Date('2017-04-27'),
      },
    ],
    allocationTarget: 0,
  },
];

export const testPrices: State['prices'] = {
  10: [
    {
      values: [
        429.5,
        429.5,
        432.3,
        434.9,
        435.7,
        437.9,
        439.6,
        436,
        434.9,
        432.8,
        438.4,
        435.5,
        434.9,
        427.9,
        426.3,
        424.3,
        423.1,
        427,
        427.9,
        430.8,
        431.6,
        425.9,
        425.4,
        432.8,
        426.7,
        424.2,
        428.1,
        426.5,
        426.1,
        424.1,
        427.3,
      ],
      startIndex: 69,
    },
  ],
  3: [
    {
      values: [
        99.86,
        99.77,
        99.15,
        99.29,
        99.63,
        98.83,
        99.11,
        99.29,
        99.08,
        99.7,
        100.25,
        101.11,
        101.39,
        101.39,
        100.19,
        101.05,
        101.37,
      ],
      startIndex: 48,
    },
  ],
  1: [
    {
      values: [
        80.9,
        80.06,
        79.36,
        78.51,
        78.56,
        78.87,
        78.27,
        78.63,
        79.44,
        79.93,
        79.84,
        80.47,
        80.85,
        81.27,
        80.88,
        81.87,
        81.76,
        82.1,
        82.72,
        81.84,
        81.8,
        80.16,
        79.79,
        80.81,
        79.59,
        79.2,
        79.01,
        79.26,
        78.15,
        78.15,
        76.61,
        77.35,
        78.54,
      ],
      startIndex: 32,
    },
  ],
  5: [
    {
      values: [
        137.77,
        136.3,
        136.08,
        135.19,
        135.13,
        133.53,
        133.68,
        133.97,
        134.62,
        133.48,
        133.91,
        129.25,
        130.8,
        127.12,
        128.4,
        128.8,
        130.29,
        129.26,
        128.96,
        125.53,
        125.45,
        128.26,
        128.64,
        130.67,
        131.16,
        131.72,
        132.55,
        132.46,
        132.92,
        133.7,
        133.65,
        134.82,
        135.04,
        136.92,
        134.23,
        134.73,
        134.55,
        133.54,
        134.3,
        135.26,
        135.73,
        136.95,
        137.14,
        137.36,
        137.16,
        139.29,
        139.97,
        140.82,
        141.89,
        142.22,
        142.93,
        143.5,
        143.02,
        141.98,
        142.03,
        141.75,
        142.23,
        143.08,
        142.88,
        144.5,
        144.85,
        144.85,
        142.2,
        144.21,
        144.94,
      ],
      startIndex: 0,
    },
  ],
};

export const testStartTime = getUnixTime(new Date('2016-10-05T10:01:01.000Z'));

export const testCacheTimes = [
  0,
  259200,
  518400,
  777600,
  950400,
  1209600,
  1408800,
  1581600,
  1840800,
  2276400,
  2449200,
  2881200,
  3140400,
  3486000,
  3745201,
  4177200,
  4350000,
  4695600,
  4953600,
  5126400,
  5472000,
  5731200,
  5990400,
  6249600,
  6595201,
  6768000,
  7113600,
  7372800,
  7545601,
  7891200,
  8150401,
  8409601,
  8668800,
  9014400,
  9187201,
  9532800,
  9792000,
  9964800,
  10310400,
  10569601,
  10828800,
  11088000,
  11433600,
  11606401,
  11952000,
  12211201,
  12556800,
  12816000,
  13161600,
  13334401,
  13852800,
  14112001,
  14371201,
  14630401,
  14972400,
  15145200,
  15404401,
  15750000,
  15922801,
  16268400,
  16527601,
  16786800,
  17046000,
  17391600,
  17564400,
  17737200,
  18082801,
  18255600,
  18601201,
  18860400,
  19033200,
  19378800,
  19810801,
  19983601,
  20415601,
  20674800,
  21020401,
  21625201,
  21884401,
  22230000,
  22489200,
  22921201,
  23094000,
  23526000,
  23785201,
  24130800,
  24390000,
  24822000,
  24994800,
  25426800,
  25858801,
  26031600,
  26463600,
  26722800,
  27068400,
  27327601,
  27759601,
  27932400,
  28364400,
  28623600,
];
