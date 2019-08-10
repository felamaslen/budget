import test from 'ava';
import sinon from 'sinon';
import React from 'react';
import '~client-test/browser';
import { render, act } from '@testing-library/react';
import { useHover } from '~client/components/Graph/hooks/hover';
import { genPixelCompute } from '~client/components/Graph/helpers';

const TestHook = ({ callback }) => {
    callback();

    return null;
};

const testHook = callback => {
    render(<TestHook callback={callback} />);
};

let hookResult = null;

const currentTarget = {
    getBoundingClientRect: () => ({
        left: 13,
        top: 25
    })
};

test.beforeEach(() => {
    testHook((() => {
        hookResult = useHover({
            lines: [
                {
                    data: [
                        [0, 0],
                        [1, 1],
                        [2, 4],
                        [3, 9]
                    ],
                    color: 'red',
                    strokeWidth: 3,
                    dashed: true,
                    fill: true,
                    smooth: true,
                    movingAverage: 2,
                    arrows: false
                },
                {
                    data: [
                        [0, 19],
                        [0.5, 0.5],
                        [4, 0]
                    ],
                    color: 'blue',
                    strokeWidth: 1,
                    smooth: false,
                    arrows: false
                }
            ],
            isMobile: false,
            calc: genPixelCompute({
                minX: 0,
                maxX: 4,
                minY: 0,
                maxY: 20,
                width: 100,
                height: 90,
                padding: [1, 5, 2, 3]
            }),
            hoverEffect: {
                labelX: String,
                labelY: value => `y-value: ${value}`,
                labelWidthY: 20
            }
        });
    }));
});

test('hlPoint is initially null', t => {
    const [hlPoint] = hookResult;

    t.is(hlPoint, null);
});

test('onMouseMove on the top left corner highlights the first point on the second line', t => {
    const clock = sinon.useFakeTimers();

    const [hlPointBefore, onMouseMove] = hookResult;
    t.is(hlPointBefore, null);

    act(() => {
        onMouseMove({
            pageX: 0,
            pageY: 0,
            currentTarget
        });

        clock.tick(11);

        onMouseMove({
            pageX: 13 + 3,
            pageY: 25 + 1,
            currentTarget
        });
    });

    const [hlPointAfter] = hookResult;
    t.deepEqual(hlPointAfter, {
        valX: 0,
        valY: 19,
        color: 'blue'
    });

    clock.restore();
});

test('onMouseMove on the bottom left corner highlights the first point on the first line', t => {
    const clock = sinon.useFakeTimers();

    const [, onMouseMove] = hookResult;

    act(() => {
        onMouseMove({
            pageX: 0,
            pageY: 0,
            currentTarget
        });

        clock.tick(11);

        onMouseMove({
            pageX: 13 + 3,
            pageY: 25 + 90 - 2,
            currentTarget
        });
    });

    const [hlPointAfter] = hookResult;
    t.deepEqual(hlPointAfter, {
        valX: 0,
        valY: 0,
        color: 'red'
    });

    clock.restore();
});

test('onMouseMove in the middle of the graph highlights the closest line point', t => {
    const clock = sinon.useFakeTimers();

    const [, onMouseMove] = hookResult;

    act(() => {
        onMouseMove({
            pageX: 0,
            pageY: 0,
            currentTarget
        });

        clock.tick(11);

        onMouseMove({
            pageX: 13 + 43,
            pageY: 25 + 37,
            currentTarget
        });
    });

    const [hlPointAfter] = hookResult;
    t.deepEqual(hlPointAfter, {
        valX: 2,
        valY: 4,
        color: 'red'
    });

    clock.restore();
});

test('onMouseLeave resets hlPoint', t => {
    const clock = sinon.useFakeTimers();

    const [, onMouseMove, onMouseLeave] = hookResult;

    const [hlPointBefore] = hookResult;
    t.not(hlPointBefore, null);

    act(() => {
        onMouseMove({
            pageX: 13 + 3,
            pageY: 25 + 1,
            currentTarget
        });

        clock.tick(3);

        onMouseLeave();

        clock.tick(8);
    });

    const [hlPointAfter] = hookResult;

    t.is(hlPointAfter, null);
});