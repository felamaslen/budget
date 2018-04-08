/* eslint max-lines: 0 */
import { List as list, Map as map } from 'immutable';
import { TransactionsList } from '../../src/helpers/data';
import { dateInput } from '../../src/helpers/date';

export const testRows = list([
    map({
        'cols': list([
            dateInput('9/5/2017'),
            'some fund 1',
            new TransactionsList([
                {
                    cost: 400000,
                    units: 934,
                    date: '2017-05-09'
                }
            ]),
            400000
        ]),
        pr: list([
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
            427.3
        ]),
        prStartIndex: 69
    }),
    map({
        cols: list([
            dateInput('2/3/2017'),
            'some fund 2',
            new TransactionsList([
                {
                    cost: 45000,
                    units: 450,
                    date: '2017-03-03'
                },
                {
                    cost: -45000,
                    units: -450,
                    date: '2017-04-27'
                }
            ]),
            0
        ]),
        pr: list([
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
            101.37
        ]),
        prStartIndex: 48
    }),
    map({
        cols: list([
            dateInput('11/1/2017'),
            'some fund 3',
            new TransactionsList([
                {
                    cost: 90000,
                    units: 1117.87,
                    date: '2017-01-11'
                },
                {
                    cost: -90000,
                    units: -1117.87,
                    date: '2017-04-27'
                }
            ]),
            0
        ]),
        pr: list([
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
            78.54
        ]),
        prStartIndex: 32
    }),
    map({
        cols: list([
            dateInput('21/9/2016'),
            'test fund 4',
            new TransactionsList([
                {
                    cost: 200000,
                    units: 1499.7,
                    date: '2016-09-21'
                },
                {
                    cost: -200000,
                    units: -1499.7,
                    date: '2017-04-27'
                }
            ]),
            0
        ]),
        pr: list([
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
            144.94
        ]),
        prStartIndex: 0
    })
]);

export const testLines = [
    [
        [
            [
                0,
                3.306834500000012
            ],
            [
                259200,
                2.2045550000000076
            ],
            [
                518400,
                2.039588000000018
            ],
            [
                777600,
                1.3722214999999998
            ],
            [
                950400,
                1.327230500000005
            ],
            [
                1209600,
                0.12747050000001037
            ],
            [
                1408800,
                0.23994800000000396
            ],
            [
                1581600,
                0.4574045000000042
            ],
            [
                1840800,
                0.9448070000000007
            ],
            [
                2276400,
                0.08997799999998825
            ],
            [
                2449200,
                0.4124134999999951
            ],
            [
                2881200,
                -3.081887499999997
            ],
            [
                3140400,
                -1.9196199999999954
            ],
            [
                3486000,
                -4.679067999999999
            ],
            [
                3745201,
                -3.719259999999995
            ],
            [
                4177200,
                -3.4193199999999924
            ],
            [
                4350000,
                -2.3020435
            ],
            [
                4695600,
                -3.0743890000000103
            ],
            [
                4953600,
                -3.2993439999999974
            ],
            [
                5126400,
                -5.871329499999993
            ],
            [
                5472000,
                -5.931317499999991
            ],
            [
                5731200,
                -3.8242390000000013
            ],
            [
                5990400,
                -3.539296000000002
            ],
            [
                6249600,
                -2.0171005000000006
            ],
            [
                6595201,
                -1.649673999999999
            ],
            [
                6768000,
                -1.2297580000000017
            ],
            [
                7113600,
                -0.6073824999999924
            ],
            [
                7372800,
                -0.6748689999999915
            ],
            [
                7545601,
                -0.3299380000000092
            ],
            [
                7891200,
                0.2549449999999924
            ],
            [
                8150401,
                0.21745250000001398
            ],
            [
                8409601,
                1.0947770000000019
            ],
            [
                8668800,
                1.0190244827586115
            ],
            [
                9014400,
                1.6674469655172515
            ],
            [
                9187201,
                0.006515241379303665
            ],
            [
                9532800,
                -0.06256734482759353
            ],
            [
                9792000,
                -0.13637855172414204
            ],
            [
                9964800,
                -0.5391914137930947
            ],
            [
                10310400,
                -0.3774500344827538
            ],
            [
                10569601,
                0.2577724482758565
            ],
            [
                10828800,
                0.8130599310344631
            ],
            [
                11088000,
                1.6328496896551625
            ],
            [
                11433600,
                1.6964133793103373
            ],
            [
                11606401,
                2.053031344827594
            ],
            [
                11952000,
                2.096083275862078
            ],
            [
                12211201,
                3.3594854827586094
            ],
            [
                12556800,
                3.560805034482739
            ],
            [
                12816000,
                4.381989965517242
            ],
            [
                13161600,
                4.216860955223865
            ],
            [
                13334401,
                4.465958507462689
            ],
            [
                13852800,
                4.907411164179107
            ],
            [
                14112001,
                4.887740537313425
            ],
            [
                14371201,
                4.705182089552235
            ],
            [
                14630401,
                3.584885134328358
            ],
            [
                14972400,
                3.5214144179104383
            ],
            [
                15145200,
                3.760611850746261
            ],
            [
                15404401,
                3.5401803880597034
            ],
            [
                15750000,
                3.8738447761194044
            ],
            [
                15922801,
                3.794789462686558
            ],
            [
                16268400,
                4.718963044776109
            ],
            [
                16527601,
                4.542861343283578
            ],
            [
                16786800,
                4.542861343283578
            ],
            [
                17046000,
                2.681450955223869
            ],
            [
                17391600,
                3.9437258208955206
            ],
            [
                17564400,
                4.710605313432848
            ]
        ],
        [
            [
                18860400,
                0.28825
            ],
            [
                19033200,
                0.28825
            ],
            [
                19378800,
                0.9420500000000029
            ],
            [
                19810801,
                1.5491499999999943
            ],
            [
                19983601,
                1.735949999999997
            ],
            [
                20415601,
                2.249649999999994
            ],
            [
                20674800,
                2.6466000000000056
            ],
            [
                21020401,
                1.806
            ],
            [
                21625201,
                1.5491499999999943
            ],
            [
                21884401,
                1.0588000000000028
            ],
            [
                22230000,
                2.3663999999999943
            ],
            [
                22489200,
                1.68925
            ],
            [
                22921201,
                1.5491499999999943
            ],
            [
                23094000,
                -0.08535000000000582
            ],
            [
                23526000,
                -0.4589499999999971
            ],
            [
                23785201,
                -0.925949999999997
            ],
            [
                24130800,
                -1.2061499999999943
            ],
            [
                24390000,
                -0.2955
            ],
            [
                24822000,
                -0.08535000000000582
            ],
            [
                24994800,
                0.5918000000000029
            ],
            [
                25426800,
                0.7786000000000058
            ],
            [
                25858801,
                -0.5523500000000058
            ],
            [
                26031600,
                -0.6691000000000058
            ],
            [
                26463600,
                1.0588000000000028
            ],
            [
                26722800,
                -0.36555000000000293
            ],
            [
                27068400,
                -0.9493000000000029
            ],
            [
                27327601,
                -0.03864999999999418
            ],
            [
                27759601,
                -0.41225
            ],
            [
                27932400,
                -0.5056499999999942
            ],
            [
                28364400,
                -0.9726499999999941
            ],
            [
                28623600,
                -0.2254499999999971
            ]
        ]
    ],
    [
        [
            [
                18860400,
                0.28825
            ],
            [
                19033200,
                0.28825
            ],
            [
                19378800,
                0.9420500000000029
            ],
            [
                19810801,
                1.5491499999999943
            ],
            [
                19983601,
                1.735949999999997
            ],
            [
                20415601,
                2.249649999999994
            ],
            [
                20674800,
                2.6466000000000056
            ],
            [
                21020401,
                1.806
            ],
            [
                21625201,
                1.5491499999999943
            ],
            [
                21884401,
                1.0588000000000028
            ],
            [
                22230000,
                2.3663999999999943
            ],
            [
                22489200,
                1.68925
            ],
            [
                22921201,
                1.5491499999999943
            ],
            [
                23094000,
                -0.08535000000000582
            ],
            [
                23526000,
                -0.4589499999999971
            ],
            [
                23785201,
                -0.925949999999997
            ],
            [
                24130800,
                -1.2061499999999943
            ],
            [
                24390000,
                -0.2955
            ],
            [
                24822000,
                -0.08535000000000582
            ],
            [
                24994800,
                0.5918000000000029
            ],
            [
                25426800,
                0.7786000000000058
            ],
            [
                25858801,
                -0.5523500000000058
            ],
            [
                26031600,
                -0.6691000000000058
            ],
            [
                26463600,
                1.0588000000000028
            ],
            [
                26722800,
                -0.36555000000000293
            ],
            [
                27068400,
                -0.9493000000000029
            ],
            [
                27327601,
                -0.03864999999999418
            ],
            [
                27759601,
                -0.41225
            ],
            [
                27932400,
                -0.5056499999999942
            ],
            [
                28364400,
                -0.9726499999999941
            ],
            [
                28623600,
                -0.2254499999999971
            ]
        ]
    ]
];

/*
];
*/

export const testStartTime = 1475661661;
export const testCacheTimes = list([
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
    28623600
]);


