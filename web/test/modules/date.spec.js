import test from 'ava';
import {
    timeSeriesTicks
} from '~client/modules/date';

test('getTimeSeriesTicker handles small ranges (less than 10 minutes)', t => {
    const result = timeSeriesTicks(1497871283, 1497871283 + 167);
    const expectedResult = [
        { label: '11:21', major: 1, time: 1497871260 },
        { label: false, major: 0, time: 1497871290 },
        { label: '11:22', major: 1, time: 1497871320 },
        { label: false, major: 0, time: 1497871350 },
        { label: '11:23', major: 1, time: 1497871380 },
        { label: false, major: 0, time: 1497871410 },
        { label: '11:24', major: 1, time: 1497871440 }
    ];

    t.deepEqual(result, expectedResult);
});

test('getTimeSeriesTicker handles ranges of between 10 minutes and one hour', t => {
    const result = timeSeriesTicks(1497871283, 1497871283 + 795);

    const expectedResult = [
        { label: false, major: 0, time: 1497871260 },
        { label: false, major: 0, time: 1497871320 },
        { label: false, major: 0, time: 1497871380 },
        { label: false, major: 0, time: 1497871440 },
        { label: false, major: 0, time: 1497871500 },
        { label: false, major: 0, time: 1497871560 },
        { label: false, major: 0, time: 1497871620 },
        { label: false, major: 0, time: 1497871680 },
        { label: false, major: 0, time: 1497871740 },
        { label: '11:30', major: 1, time: 1497871800 },
        { label: false, major: 0, time: 1497871860 },
        { label: false, major: 0, time: 1497871920 },
        { label: false, major: 0, time: 1497871980 },
        { label: false, major: 0, time: 1497872040 },
        { label: false, major: 0, time: 1497872100 }
    ];

    t.deepEqual(result, expectedResult);
});

test('getTimeSeriesTicker handles ranges of between one hour and 0.6 days', t => {
    const result = timeSeriesTicks(1497871283, 1497871283 + 51320);

    const expectedResult = [
        { label: '11:00', major: 1, time: 1497870000 },
        { label: false, major: 0, time: 1497871800 },
        { label: '12:00', major: 1, time: 1497873600 },
        { label: false, major: 0, time: 1497875400 },
        { label: '13:00', major: 1, time: 1497877200 },
        { label: false, major: 0, time: 1497879000 },
        { label: '14:00', major: 1, time: 1497880800 },
        { label: false, major: 0, time: 1497882600 },
        { label: '15:00', major: 1, time: 1497884400 },
        { label: false, major: 0, time: 1497886200 },
        { label: '16:00', major: 1, time: 1497888000 },
        { label: false, major: 0, time: 1497889800 },
        { label: '17:00', major: 1, time: 1497891600 },
        { label: false, major: 0, time: 1497893400 },
        { label: '18:00', major: 1, time: 1497895200 },
        { label: false, major: 0, time: 1497897000 },
        { label: '19:00', major: 1, time: 1497898800 },
        { label: false, major: 0, time: 1497900600 },
        { label: '20:00', major: 1, time: 1497902400 },
        { label: false, major: 0, time: 1497904200 },
        { label: '21:00', major: 1, time: 1497906000 },
        { label: false, major: 0, time: 1497907800 },
        { label: '22:00', major: 1, time: 1497909600 },
        { label: false, major: 0, time: 1497911400 },
        { label: '23:00', major: 1, time: 1497913200 },
        { label: false, major: 0, time: 1497915000 },
        { label: 'Tue', major: 2, time: 1497916800 },
        { label: false, major: 0, time: 1497918600 },
        { label: '01:00', major: 1, time: 1497920400 },
        { label: false, major: 0, time: 1497922200 }
    ];

    t.deepEqual(result, expectedResult);
});

test('getTimeSeriesTicker handles ranges of between 0.6 days and eight days', t => {
    const result = timeSeriesTicks(1497871283, 1497871283 + 86400 * 3.32);

    const expectedResult = [
        { label: false, major: 0, time: 1497862800 },
        { label: false, major: 0, time: 1497873600 },
        { label: false, major: 0, time: 1497884400 },
        { label: false, major: 0, time: 1497895200 },
        { label: false, major: 0, time: 1497906000 },
        { label: 'Tue', major: 1, time: 1497916800 },
        { label: false, major: 0, time: 1497927600 },
        { label: false, major: 0, time: 1497938400 },
        { label: false, major: 0, time: 1497949200 },
        { label: false, major: 0, time: 1497960000 },
        { label: false, major: 0, time: 1497970800 },
        { label: false, major: 0, time: 1497981600 },
        { label: false, major: 0, time: 1497992400 },
        { label: 'Wed', major: 1, time: 1498003200 },
        { label: false, major: 0, time: 1498014000 },
        { label: false, major: 0, time: 1498024800 },
        { label: false, major: 0, time: 1498035600 },
        { label: false, major: 0, time: 1498046400 },
        { label: false, major: 0, time: 1498057200 },
        { label: false, major: 0, time: 1498068000 },
        { label: false, major: 0, time: 1498078800 },
        { label: 'Thu', major: 1, time: 1498089600 },
        { label: false, major: 0, time: 1498100400 },
        { label: false, major: 0, time: 1498111200 },
        { label: false, major: 0, time: 1498122000 },
        { label: false, major: 0, time: 1498132800 },
        { label: false, major: 0, time: 1498143600 },
        { label: false, major: 0, time: 1498154400 }
    ];

    t.deepEqual(result, expectedResult);
});

test('getTimeSeriesTicker handles ranges of between eight and 35 days', t => {
    const result = timeSeriesTicks(1497871283, 1497871283 + 86400 * 11.4);

    const expectedResult = [
        { label: false, major: 0, time: 1497830400 },
        { label: false, major: 0, time: 1497916800 },
        { label: false, major: 0, time: 1498003200 },
        { label: false, major: 0, time: 1498089600 },
        { label: false, major: 0, time: 1498176000 },
        { label: false, major: 0, time: 1498262400 },
        { label: '25 Jun', major: 1, time: 1498348800 },
        { label: false, major: 0, time: 1498435200 },
        { label: false, major: 0, time: 1498521600 },
        { label: false, major: 0, time: 1498608000 },
        { label: false, major: 0, time: 1498694400 },
        { label: false, major: 0, time: 1498780800 },
        { label: false, major: 0, time: 1498867200 }
    ];

    t.deepEqual(result, expectedResult);
});

test('getTimeSeriesTicker handles ranges of between 35 days and a year', t => {
    const result = timeSeriesTicks(1497871283, 1497871283 + 86400 * 35 * 1.5);

    const expectedResult = [
        { label: false, major: 0, time: 1497830400 },
        { label: false, major: 0, time: 1498435200 },
        { label: 'Jul', major: 2, time: 1498867201 },
        { label: false, major: 0, time: 1499040000 },
        { label: false, major: 0, time: 1499644800 },
        { label: false, major: 0, time: 1500249600 },
        { label: false, major: 0, time: 1500854400 },
        { label: false, major: 0, time: 1501459200 },
        { label: 'Aug', major: 2, time: 1501545601 },
        { label: false, major: 0, time: 1502064000 },
        { label: false, major: 0, time: 1502668800 }
    ];

    t.deepEqual(result, expectedResult);
});

test('getTimeSeriesTicker handles ranges of years', t => {
    const result = timeSeriesTicks(1456790400, 1494073200);

    const expectedResult = [
        { label: false, major: 0, time: 1456790400 },
        { label: false, major: 0, time: 1459468800 },
        { label: false, major: 0, time: 1462060800 },
        { label: false, major: 0, time: 1464739200 },
        { label: 'H2', major: 1, time: 1467331200 },
        { label: false, major: 0, time: 1470009600 },
        { label: false, major: 0, time: 1472688000 },
        { label: false, major: 0, time: 1475280000 },
        { label: false, major: 0, time: 1477958400 },
        { label: false, major: 0, time: 1480550400 },
        { label: '2017', major: 2, time: 1483228800 },
        { label: false, major: 0, time: 1485907200 },
        { label: false, major: 0, time: 1488326400 },
        { label: false, major: 0, time: 1491004800 },
        { label: false, major: 0, time: 1493596800 }
    ];

    t.deepEqual(result, expectedResult);
});
