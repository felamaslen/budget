/* eslint-disable max-lines */
import getUnixTime from 'date-fns/getUnixTime';

import { COLOR_GRAPH_FUND_LINE } from '~client/constants/colors';
import { GRAPH_FUNDS_OVERALL_ID } from '~client/constants/graph';
import { colorKey } from '~client/modules/color';
import { getTransactionsList } from '~client/modules/data';
import { Fund } from '~client/types/funds';

export const testRows: Fund[] = [
  {
    id: '10',
    item: 'some fund 1',
    transactions: getTransactionsList([
      {
        cost: 400000,
        units: 934,
        date: '2017-05-09',
      },
    ]),
  },
  {
    id: '3',
    item: 'some fund 2',
    transactions: getTransactionsList([
      {
        cost: 45000,
        units: 450,
        date: '2017-03-03',
      },
      {
        cost: -50300,
        units: -450,
        date: '2017-04-27',
      },
    ]),
  },
  {
    id: '1',
    item: 'some fund 3',
    transactions: getTransactionsList([
      {
        cost: 90000,
        units: 1117.87,
        date: '2017-01-11',
      },
      {
        cost: -80760,
        units: -1117.87,
        date: '2017-04-27',
      },
    ]),
  },
  {
    id: '5',
    item: 'test fund 4',
    transactions: getTransactionsList([
      {
        cost: 200000,
        units: 1499.7,
        date: '2016-09-21',
      },
      {
        cost: -265622,
        units: -1499.7,
        date: '2017-04-27',
      },
    ]),
  },
];

export const testPrices = {
  10: {
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
  3: {
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
  1: {
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
  5: {
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

export const testLinesRoi = [
  {
    id: GRAPH_FUNDS_OVERALL_ID,
    color: COLOR_GRAPH_FUND_LINE,
    data: [
      [0, 3.306834500000012],
      [259200, 2.2045550000000076],
      [518400, 2.039588000000018],
      [777600, 1.3722214999999995],
      [950400, 1.327230500000005],
      [1209600, 0.12747050000001037],
      [1408800, 0.23994800000000396],
      [1581600, 0.4574045000000042],
      [1840800, 0.9448070000000006],
      [2276400, 0.08997799999998825],
      [2449200, 0.41241349999999505],
      [2881200, -3.081887499999997],
      [3140400, -1.9196199999999954],
      [3486000, -4.679067999999999],
      [3745201, -3.719259999999995],
      [4177200, -3.4193199999999924],
      [4350000, -2.3020435],
      [4695600, -3.07438900000001],
      [4953600, -3.299343999999997],
      [5126400, -5.871329499999992],
      [5472000, -5.93131749999999],
      [5731200, -3.8242390000000013],
      [5990400, -3.539296000000002],
      [6249600, -2.0171005000000006],
      [6595201, -1.6496739999999992],
      [6768000, -1.2297580000000017],
      [7113600, -0.6073824999999924],
      [7372800, -0.6748689999999915],
      [7545601, -0.3299380000000092],
      [7891200, 0.2549449999999924],
      [8150401, 0.21745250000001398],
      [8409601, 1.0947770000000019],
      [8668800, 1.0190244827586115],
      [9014400, 1.6674469655172515],
      [9187201, 0.006515241379303665],
      [9532800, -0.06256734482759352],
      [9792000, -0.13637855172414204],
      [9964800, -0.5391914137930947],
      [10310400, -0.3774500344827539],
      [10569601, 0.2577724482758565],
      [10828800, 0.8130599310344631],
      [11088000, 1.6328496896551625],
      [11433600, 1.696413379310337],
      [11606401, 2.053031344827594],
      [11952000, 2.096083275862078],
      [12211201, 3.35948548275861],
      [12556800, 3.560805034482739],
      [12816000, 4.381989965517243],
      [13161600, 4.216860955223865],
      [13334401, 4.465958507462689],
      [13852800, 4.907411164179107],
      [14112001, 4.887740537313425],
      [14371201, 4.705182089552235],
      [14630401, 3.584885134328358],
      [14972400, 3.521414417910438],
      [15145200, 3.760611850746261],
      [15404401, 3.5401803880597034],
      [15750000, 3.873844776119404],
      [15922801, 3.794789462686558],
      [16268400, 4.718963044776109],
      [16527601, 4.542861343283578],
      [16786800, 4.542861343283578],
      [17046000, 2.681450955223869],
      [17391600, 3.943725820895521],
      [17564400, 4.710605313432847],
    ],
  },
  {
    id: GRAPH_FUNDS_OVERALL_ID,
    color: COLOR_GRAPH_FUND_LINE,
    data: [
      [18860400, 0.28825],
      [19033200, 0.28825],
      [19378800, 0.9420500000000029],
      [19810801, 1.549149999999994],
      [19983601, 1.7359499999999972],
      [20415601, 2.249649999999994],
      [20674800, 2.646600000000006],
      [21020401, 1.806],
      [21625201, 1.549149999999994],
      [21884401, 1.058800000000003],
      [22230000, 2.3663999999999943],
      [22489200, 1.6892500000000001],
      [22921201, 1.549149999999994],
      [23094000, -0.08535000000000582],
      [23526000, -0.45894999999999714],
      [23785201, -0.925949999999997],
      [24130800, -1.2061499999999943],
      [24390000, -0.29550000000000004],
      [24822000, -0.08535000000000582],
      [24994800, 0.5918000000000029],
      [25426800, 0.7786000000000058],
      [25858801, -0.5523500000000058],
      [26031600, -0.6691000000000058],
      [26463600, 1.058800000000003],
      [26722800, -0.3655500000000029],
      [27068400, -0.9493000000000029],
      [27327601, -0.03864999999999418],
      [27759601, -0.41225],
      [27932400, -0.5056499999999942],
      [28364400, -0.9726499999999941],
      [28623600, -0.2254499999999971],
    ],
  },
  {
    id: '10',
    color: colorKey('some fund 1'),
    data: [
      [18860400, 0.28825],
      [19033200, 0.28825],
      [19378800, 0.9420500000000029],
      [19810801, 1.549149999999994],
      [19983601, 1.7359499999999972],
      [20415601, 2.249649999999994],
      [20674800, 2.646600000000006],
      [21020401, 1.806],
      [21625201, 1.549149999999994],
      [21884401, 1.058800000000003],
      [22230000, 2.3663999999999943],
      [22489200, 1.6892500000000001],
      [22921201, 1.549149999999994],
      [23094000, -0.08535000000000582],
      [23526000, -0.45894999999999714],
      [23785201, -0.925949999999997],
      [24130800, -1.2061499999999943],
      [24390000, -0.29550000000000004],
      [24822000, -0.08535000000000582],
      [24994800, 0.5918000000000029],
      [25426800, 0.7786000000000058],
      [25858801, -0.5523500000000058],
      [26031600, -0.6691000000000058],
      [26463600, 1.058800000000003],
      [26722800, -0.3655500000000029],
      [27068400, -0.9493000000000029],
      [27327601, -0.03864999999999418],
      [27759601, -0.41225],
      [27932400, -0.5056499999999942],
      [28364400, -0.9726499999999941],
      [28623600, -0.2254499999999971],
    ],
  },
  {
    id: '3',
    color: colorKey('some fund 2'),
    data: [
      [13161600, -0.13999999999999999],
      [13334401, -0.22999999999999998],
      [13852800, -0.8500000000000001],
      [14112001, -0.7100000000000001],
      [14371201, -0.37],
      [14630401, -1.17],
      [14972400, -0.89],
      [15145200, -0.7100000000000001],
      [15404401, -0.9199999999999999],
      [15750000, -0.3],
      [15922801, 0.25],
      [16268400, 1.11],
      [16527601, 1.39],
      [16786800, 1.39],
      [17046000, 0.19],
      [17391600, 1.05],
      [17564400, 1.37],
    ],
  },
  {
    id: '1',
    color: colorKey('some fund 3'),
    data: [
      [8668800, 0.48409222222222725],
      [9014400, -0.5592531111111102],
      [9187201, -1.4287075555555606],
      [9532800, -2.484473666666664],
      [9792000, -2.422369777777785],
      [9964800, -2.037325666666665],
      [10310400, -2.7825723333333414],
      [10569601, -2.3354243333333415],
      [10828800, -1.329341333333351],
      [11088000, -0.720723222222231],
      [11433600, -0.8325102222222227],
      [11606401, -0.050001222222231766],
      [11952000, 0.42198833333331603],
      [12211201, 0.9436609999999929],
      [12556800, 0.45925066666664655],
      [12816000, 1.6889076666666694],
      [13161600, 1.552279111111113],
      [13334401, 1.9745855555555316],
      [13852800, 2.7446737777777725],
      [14112001, 1.6516453333333225],
      [14371201, 1.6019622222222096],
      [14630401, -0.43504533333335227],
      [14972400, -0.8946141111111177],
      [15145200, 0.3723052222222193],
      [15404401, -1.143029666666666],
      [15750000, -1.627440000000012],
      [15922801, -1.8634347777777778],
      [16268400, -1.5529153333333348],
      [16527601, -2.9316216666666635],
      [16786800, -2.9316216666666635],
      [17046000, -4.8444214444444516],
      [17391600, -3.9252838888889046],
      [17564400, -2.4472113333333336],
    ],
  },
  {
    id: '5',
    color: colorKey('test fund 4'),
    data: [
      [0, 3.306834500000012],
      [259200, 2.2045550000000076],
      [518400, 2.039588000000018],
      [777600, 1.3722214999999995],
      [950400, 1.327230500000005],
      [1209600, 0.12747050000001037],
      [1408800, 0.23994800000000396],
      [1581600, 0.4574045000000042],
      [1840800, 0.9448070000000006],
      [2276400, 0.08997799999998825],
      [2449200, 0.41241349999999505],
      [2881200, -3.081887499999997],
      [3140400, -1.9196199999999954],
      [3486000, -4.679067999999999],
      [3745201, -3.719259999999995],
      [4177200, -3.4193199999999924],
      [4350000, -2.3020435],
      [4695600, -3.07438900000001],
      [4953600, -3.299343999999997],
      [5126400, -5.871329499999992],
      [5472000, -5.93131749999999],
      [5731200, -3.8242390000000013],
      [5990400, -3.539296000000002],
      [6249600, -2.0171005000000006],
      [6595201, -1.6496739999999992],
      [6768000, -1.2297580000000017],
      [7113600, -0.6073824999999924],
      [7372800, -0.6748689999999915],
      [7545601, -0.3299380000000092],
      [7891200, 0.2549449999999924],
      [8150401, 0.21745250000001398],
      [8409601, 1.0947770000000019],
      [8668800, 1.2597439999999915],
      [9014400, 2.6694619999999993],
      [9187201, 0.6523654999999999],
      [9532800, 1.0272904999999883],
      [9792000, 0.8923175000000048],
      [9964800, 0.13496899999999734],
      [10310400, 0.7048550000000104],
      [10569601, 1.4247109999999956],
      [10828800, 1.7771404999999942],
      [11088000, 2.6919574999999893],
      [11433600, 2.834428999999989],
      [11606401, 2.999396000000008],
      [11952000, 2.8494260000000065],
      [12211201, 4.446606499999994],
      [12556800, 4.956504499999995],
      [12816000, 5.593876999999993],
      [13161600, 6.396216499999994],
      [13334401, 6.6436670000000015],
      [13852800, 7.176060500000007],
      [14112001, 7.603475000000006],
      [14371201, 7.243547000000006],
      [14630401, 6.463702999999994],
      [14972400, 6.5011955000000015],
      [15145200, 6.291237500000004],
      [15404401, 6.651165500000003],
      [15750000, 7.288538000000015],
      [15922801, 7.138567999999999],
      [16268400, 8.353324999999998],
      [16527601, 8.615772499999991],
      [16786800, 8.615772499999991],
      [17046000, 6.628669999999998],
      [17391600, 8.135868500000011],
      [17564400, 8.683259000000005],
    ],
  },
];

export const testLinesAbsolute = [
  {
    id: GRAPH_FUNDS_OVERALL_ID,
    color: COLOR_GRAPH_FUND_LINE,
    data: [
      [0, 206613.66900000002],
      [259200, 204409.11000000002],
      [518400, 204079.17600000004],
      [777600, 202744.443],
      [950400, 202654.461],
      [1209600, 200254.94100000002],
      [1408800, 200479.896],
      [1581600, 200914.809],
      [1840800, 201889.614],
      [2276400, 200179.95599999998],
      [2449200, 200824.827],
      [2881200, 193836.225],
      [3140400, 196160.76],
      [3486000, 190641.864],
      [3745201, 192561.48],
      [4177200, 193161.36000000002],
      [4350000, 195395.913],
      [4695600, 193851.22199999998],
      [4953600, 193401.312],
      [5126400, 188257.34100000001],
      [5472000, 188137.36500000002],
      [5731200, 192351.522],
      [5990400, 192921.408],
      [6249600, 195965.799],
      [6595201, 196700.652],
      [6768000, 197540.484],
      [7113600, 198785.23500000002],
      [7372800, 198650.26200000002],
      [7545601, 199340.12399999998],
      [7891200, 200509.88999999998],
      [8150401, 200434.90500000003],
      [8409601, 202189.554],
      [8668800, 292955.171],
      [9014400, 294835.5962],
      [9187201, 290018.8942],
      [9532800, 289818.5547],
      [9792000, 289604.5022],
      [9964800, 288436.3449],
      [10310400, 288905.3949],
      [10569601, 290747.5401],
      [10828800, 292357.87379999994],
      [11088000, 294735.2641],
      [11433600, 294919.5988],
      [11606401, 295953.7909],
      [11952000, 296078.6415],
      [12211201, 299742.50789999997],
      [12556800, 300326.33459999994],
      [12816000, 302707.7709],
      [13161600, 349126.48419999995],
      [13334401, 349960.961],
      [13852800, 351439.8274],
      [14112001, 351373.9308],
      [14371201, 350762.36],
      [14630401, 347009.3652],
      [14972400, 346796.73829999997],
      [15145200, 347598.0497],
      [15404401, 346859.6043],
      [15750000, 347977.38],
      [15922801, 347712.54469999997],
      [16268400, 350808.52619999996],
      [16527601, 350218.5855],
      [16786800, 350218.5855],
      [17046000, 343982.86069999996],
      [17391600, 348211.4815],
      [17564400, 350780.52780000004],
    ],
  },
  {
    id: GRAPH_FUNDS_OVERALL_ID,
    color: COLOR_GRAPH_FUND_LINE,
    data: [
      [18860400, 401153],
      [19033200, 401153],
      [19378800, 403768.2],
      [19810801, 406196.6],
      [19983601, 406943.8],
      [20415601, 408998.6],
      [20674800, 410586.4],
      [21020401, 407224],
      [21625201, 406196.6],
      [21884401, 404235.2],
      [22230000, 409465.6],
      [22489200, 406757],
      [22921201, 406196.6],
      [23094000, 399658.6],
      [23526000, 398164.2],
      [23785201, 396296.2],
      [24130800, 395175.4],
      [24390000, 398818],
      [24822000, 399658.6],
      [24994800, 402367.2],
      [25426800, 403114.4],
      [25858801, 397790.6],
      [26031600, 397323.6],
      [26463600, 404235.2],
      [26722800, 398537.8],
      [27068400, 396202.8],
      [27327601, 399845.4],
      [27759601, 398351],
      [27932400, 397977.4],
      [28364400, 396109.4],
      [28623600, 399098.2],
    ],
  },
  {
    id: '10',
    color: colorKey('some fund 1'),
    data: [
      [18860400, 401153],
      [19033200, 401153],
      [19378800, 403768.2],
      [19810801, 406196.6],
      [19983601, 406943.8],
      [20415601, 408998.6],
      [20674800, 410586.4],
      [21020401, 407224],
      [21625201, 406196.6],
      [21884401, 404235.2],
      [22230000, 409465.6],
      [22489200, 406757],
      [22921201, 406196.6],
      [23094000, 399658.6],
      [23526000, 398164.2],
      [23785201, 396296.2],
      [24130800, 395175.4],
      [24390000, 398818],
      [24822000, 399658.6],
      [24994800, 402367.2],
      [25426800, 403114.4],
      [25858801, 397790.6],
      [26031600, 397323.6],
      [26463600, 404235.2],
      [26722800, 398537.8],
      [27068400, 396202.8],
      [27327601, 399845.4],
      [27759601, 398351],
      [27932400, 397977.4],
      [28364400, 396109.4],
      [28623600, 399098.2],
    ],
  },
  {
    id: '3',
    color: colorKey('some fund 2'),
    data: [
      [13161600, 44937],
      [13334401, 44896.5],
      [13852800, 44617.5],
      [14112001, 44680.5],
      [14371201, 44833.5],
      [14630401, 44473.5],
      [14972400, 44599.5],
      [15145200, 44680.5],
      [15404401, 44586],
      [15750000, 44865],
      [15922801, 45112.5],
      [16268400, 45499.5],
      [16527601, 45625.5],
      [16786800, 45625.5],
      [17046000, 45085.5],
      [17391600, 45472.5],
      [17564400, 45616.5],
    ],
  },
  {
    id: '1',
    color: colorKey('some fund 3'),
    data: [
      [8668800, 90435.683],
      [9014400, 89496.6722],
      [9187201, 88714.1632],
      [9532800, 87763.9737],
      [9792000, 87819.8672],
      [9964800, 88166.4069],
      [10310400, 87495.6849],
      [10569601, 87898.11809999999],
      [10828800, 88803.59279999998],
      [11088000, 89351.34909999999],
      [11433600, 89250.7408],
      [11606401, 89954.99889999999],
      [11952000, 90379.78949999998],
      [12211201, 90849.2949],
      [12556800, 90413.32559999998],
      [12816000, 91520.0169],
      [13161600, 91397.0512],
      [13334401, 91777.12699999998],
      [13852800, 92470.2064],
      [14112001, 91486.48079999999],
      [14371201, 91441.76599999999],
      [14630401, 89608.45919999998],
      [14972400, 89194.8473],
      [15145200, 90335.0747],
      [15404401, 88971.2733],
      [15750000, 88535.30399999999],
      [15922801, 88322.9087],
      [16268400, 88602.3762],
      [16527601, 87361.5405],
      [16786800, 87361.5405],
      [17046000, 85640.0207],
      [17391600, 86467.24449999999],
      [17564400, 87797.5098],
    ],
  },
  {
    id: '5',
    color: colorKey('test fund 4'),
    data: [
      [0, 206613.66900000002],
      [259200, 204409.11000000002],
      [518400, 204079.17600000004],
      [777600, 202744.443],
      [950400, 202654.461],
      [1209600, 200254.94100000002],
      [1408800, 200479.896],
      [1581600, 200914.809],
      [1840800, 201889.614],
      [2276400, 200179.95599999998],
      [2449200, 200824.827],
      [2881200, 193836.225],
      [3140400, 196160.76],
      [3486000, 190641.864],
      [3745201, 192561.48],
      [4177200, 193161.36000000002],
      [4350000, 195395.913],
      [4695600, 193851.22199999998],
      [4953600, 193401.312],
      [5126400, 188257.34100000001],
      [5472000, 188137.36500000002],
      [5731200, 192351.522],
      [5990400, 192921.408],
      [6249600, 195965.799],
      [6595201, 196700.652],
      [6768000, 197540.484],
      [7113600, 198785.23500000002],
      [7372800, 198650.26200000002],
      [7545601, 199340.12399999998],
      [7891200, 200509.88999999998],
      [8150401, 200434.90500000003],
      [8409601, 202189.554],
      [8668800, 202519.48799999998],
      [9014400, 205338.924],
      [9187201, 201304.731],
      [9532800, 202054.58099999998],
      [9792000, 201784.635],
      [9964800, 200269.938],
      [10310400, 201409.71000000002],
      [10569601, 202849.422],
      [10828800, 203554.281],
      [11088000, 205383.91499999998],
      [11433600, 205668.85799999998],
      [11606401, 205998.79200000002],
      [11952000, 205698.852],
      [12211201, 208893.213],
      [12556800, 209913.009],
      [12816000, 211187.754],
      [13161600, 212792.433],
      [13334401, 213287.334],
      [13852800, 214352.121],
      [14112001, 215206.95],
      [14371201, 214487.094],
      [14630401, 212927.406],
      [14972400, 213002.391],
      [15145200, 212582.475],
      [15404401, 213302.331],
      [15750000, 214577.07600000003],
      [15922801, 214277.136],
      [16268400, 216706.65],
      [16527601, 217231.54499999998],
      [16786800, 217231.54499999998],
      [17046000, 213257.34],
      [17391600, 216271.73700000002],
      [17564400, 217366.518],
    ],
  },
];

export const testLinesPrice = [
  {
    id: '10',
    color: colorKey('some fund 1'),
    data: [
      [18860400, 429.5],
      [19033200, 429.5],
      [19378800, 432.3],
      [19810801, 434.9],
      [19983601, 435.7],
      [20415601, 437.9],
      [20674800, 439.6],
      [21020401, 436],
      [21625201, 434.9],
      [21884401, 432.8],
      [22230000, 438.4],
      [22489200, 435.5],
      [22921201, 434.9],
      [23094000, 427.9],
      [23526000, 426.3],
      [23785201, 424.3],
      [24130800, 423.1],
      [24390000, 427],
      [24822000, 427.9],
      [24994800, 430.8],
      [25426800, 431.6],
      [25858801, 425.9],
      [26031600, 425.4],
      [26463600, 432.8],
      [26722800, 426.7],
      [27068400, 424.2],
      [27327601, 428.1],
      [27759601, 426.5],
      [27932400, 426.1],
      [28364400, 424.1],
      [28623600, 427.3],
    ],
  },
  {
    id: '3',
    color: colorKey('some fund 2'),
    data: [
      [13161600, 99.86],
      [13334401, 99.77],
      [13852800, 99.15],
      [14112001, 99.29],
      [14371201, 99.63],
      [14630401, 98.83],
      [14972400, 99.11],
      [15145200, 99.29],
      [15404401, 99.08],
      [15750000, 99.7],
      [15922801, 100.25],
      [16268400, 101.11],
      [16527601, 101.39],
      [16786800, 101.39],
      [17046000, 100.19],
      [17391600, 101.05],
      [17564400, 101.37],
    ],
  },
  {
    id: '1',
    color: colorKey('some fund 3'),
    data: [
      [8668800, 80.9],
      [9014400, 80.06],
      [9187201, 79.36],
      [9532800, 78.51],
      [9792000, 78.56],
      [9964800, 78.87],
      [10310400, 78.27],
      [10569601, 78.63],
      [10828800, 79.44],
      [11088000, 79.93],
      [11433600, 79.84],
      [11606401, 80.47],
      [11952000, 80.85],
      [12211201, 81.27],
      [12556800, 80.88],
      [12816000, 81.87],
      [13161600, 81.76],
      [13334401, 82.1],
      [13852800, 82.72],
      [14112001, 81.84],
      [14371201, 81.8],
      [14630401, 80.16],
      [14972400, 79.79],
      [15145200, 80.81],
      [15404401, 79.59],
      [15750000, 79.2],
      [15922801, 79.01],
      [16268400, 79.26],
      [16527601, 78.15],
      [16786800, 78.15],
      [17046000, 76.61],
      [17391600, 77.35],
      [17564400, 78.54],
    ],
  },
  {
    id: '5',
    color: colorKey('test fund 4'),
    data: [
      [0, 137.77],
      [259200, 136.3],
      [518400, 136.08],
      [777600, 135.19],
      [950400, 135.13],
      [1209600, 133.53],
      [1408800, 133.68],
      [1581600, 133.97],
      [1840800, 134.62],
      [2276400, 133.48],
      [2449200, 133.91],
      [2881200, 129.25],
      [3140400, 130.8],
      [3486000, 127.12],
      [3745201, 128.4],
      [4177200, 128.8],
      [4350000, 130.29],
      [4695600, 129.26],
      [4953600, 128.96],
      [5126400, 125.53],
      [5472000, 125.45],
      [5731200, 128.26],
      [5990400, 128.64],
      [6249600, 130.67],
      [6595201, 131.16],
      [6768000, 131.72],
      [7113600, 132.55],
      [7372800, 132.46],
      [7545601, 132.92],
      [7891200, 133.7],
      [8150401, 133.65],
      [8409601, 134.82],
      [8668800, 135.04],
      [9014400, 136.92],
      [9187201, 134.23],
      [9532800, 134.73],
      [9792000, 134.55],
      [9964800, 133.54],
      [10310400, 134.3],
      [10569601, 135.26],
      [10828800, 135.73],
      [11088000, 136.95],
      [11433600, 137.14],
      [11606401, 137.36],
      [11952000, 137.16],
      [12211201, 139.29],
      [12556800, 139.97],
      [12816000, 140.82],
      [13161600, 141.89],
      [13334401, 142.22],
      [13852800, 142.93],
      [14112001, 143.5],
      [14371201, 143.02],
      [14630401, 141.98],
      [14972400, 142.03],
      [15145200, 141.75],
      [15404401, 142.23],
      [15750000, 143.08],
      [15922801, 142.88],
      [16268400, 144.5],
      [16527601, 144.85],
      [16786800, 144.85],
      [17046000, 142.2],
      [17391600, 144.21],
      [17564400, 144.94],
    ],
  },
];
