import getUnixTime from 'date-fns/getUnixTime';
import numericHash from 'string-hash';

import { State } from '~client/reducers/funds';
import type { FundNative } from '~client/types';

export const testRows: FundNative[] = [
  {
    id: numericHash('some-fund-1'),
    item: 'some fund 1',
    transactions: [
      {
        price: 428,
        units: 934,
        fees: 148,
        taxes: 100,
        date: new Date('2017-05-09'),
        drip: false,
        pension: false,
      },
    ],
    stockSplits: [],
    allocationTarget: 0,
  },
  {
    id: numericHash('some-fund-2'),
    item: 'some fund 2',
    transactions: [
      {
        units: 450,
        price: 100,
        fees: 0,
        taxes: 0,
        date: new Date('2017-03-03'),
        drip: false,
        pension: false,
      },
      {
        units: -450,
        price: 112,
        fees: 20,
        taxes: 80,
        date: new Date('2017-04-27'),
        drip: false,
        pension: false,
      },
    ],
    stockSplits: [],
    allocationTarget: 0,
  },
  {
    id: numericHash('some-fund-3'),
    item: 'some fund 3',
    transactions: [
      {
        units: 1117.87,
        price: 80.510256,
        fees: 0,
        taxes: 0,
        date: new Date('2017-01-11'),
        drip: false,
        pension: false,
      },
      {
        units: -1117.87,
        price: 72.24453648,
        fees: 0,
        taxes: 0,
        date: new Date('2017-04-27'),
        drip: false,
        pension: false,
      },
    ],
    stockSplits: [],
    allocationTarget: 0,
  },
  {
    id: numericHash('some-fund-4'),
    item: 'test fund 4',
    transactions: [
      {
        units: 1499.7,
        price: 133.36,
        fees: 0,
        taxes: 0,
        date: new Date('2016-09-21'),
        drip: false,
        pension: false,
      },
      {
        units: -1499.7,
        price: 177.1167567,
        fees: 0,
        taxes: 0,
        date: new Date('2017-04-27'),
        drip: false,
        pension: false,
      },
    ],
    stockSplits: [],
    allocationTarget: 0,
  },
];

export const testPrices: State['prices'] = {
  [numericHash('some-fund-1')]: [
    {
      startIndex: 1,
      values: [176.3, 175],
    },
  ],
  [numericHash('some-fund-2')]: [
    {
      startIndex: 1,
      values: [98.32, 99.29],
    },
  ],
  [numericHash('some-fund-3')]: [
    {
      startIndex: 0,
      values: [8152.18],
    },
    {
      startIndex: 3,
      values: [8114.39],
    },
  ],
  [numericHash('some-fund-4')]: [
    {
      startIndex: 1,
      values: [249.93, 247.5],
    },
  ],
};

export const testStartTime = getUnixTime(new Date('2017-04-25T18:15:39Z'));

export const testCacheTimes = [
  0,
  getUnixTime(new Date('2020-04-20T18:15:39Z')) - testStartTime,
  getUnixTime(new Date('2020-04-20T18:43:19Z')) - testStartTime,
  getUnixTime(new Date('2020-04-26T18:43:19Z')) - testStartTime,
];
