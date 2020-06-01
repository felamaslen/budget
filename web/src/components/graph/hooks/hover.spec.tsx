import sinon from 'sinon';
import React from 'react';
import { render, act } from '@testing-library/react';
import { useHover, HookResult } from './hover';
import { genPixelCompute } from '~client/components/graph/helpers';
import { Data } from '~client/types/graph';

describe('Hover hook', () => {
  let hookResult: HookResult;
  const TestHook: React.FC = () => {
    hookResult = useHover({
      lines: [
        {
          key: 'line-a',
          data: [
            [0, 0],
            [1, 1],
            [2, 4],
            [3, 9],
          ] as Data,
          color: 'red',
          strokeWidth: 3,
          dashed: true,
          fill: true,
          smooth: true,
          movingAverage: 2,
          arrows: false,
        },
        {
          key: 'line-b',
          data: [
            [0, 19],
            [0.5, 0.5],
            [4, 0],
          ] as Data,
          color: 'blue',
          strokeWidth: 1,
          smooth: false,
          arrows: false,
        },
      ],
      isMobile: false,
      calc: genPixelCompute({
        minX: 0,
        maxX: 4,
        minY: 0,
        maxY: 20,
        width: 100,
        height: 90,
        padding: [1, 5, 2, 3],
      }),
      hoverEffect: {
        labelX: String,
        labelY: (value): string => `y-value: ${value}`,
        labelWidthY: 20,
      },
    });

    return null;
  };

  const currentTarget = {
    getBoundingClientRect: (): { left: number; top: number } => ({
      left: 13,
      top: 25,
    }),
  } as HTMLElement;

  beforeEach(() => {
    render(<TestHook />);
  });

  describe('hlPoint', () => {
    it('should initially be undefined', () => {
      expect.assertions(1);
      const [hlPoint] = hookResult;

      expect(hlPoint).toBeUndefined();
    });
  });

  describe('onMouseMove', () => {
    describe('on the top left corner', () => {
      it('should highlight the first point on the second line', () => {
        expect.assertions(2);
        const clock = sinon.useFakeTimers();

        const [hlPointBefore, onMouseMove] = hookResult;
        expect(hlPointBefore).toBeUndefined();

        act(() => {
          onMouseMove({
            pageX: 0,
            pageY: 0,
            currentTarget,
          });

          clock.tick(11);

          onMouseMove({
            pageX: 13 + 3,
            pageY: 25 + 1,
            currentTarget,
          });
        });

        const [hlPointAfter] = hookResult;
        expect(hlPointAfter).toStrictEqual({
          valX: 0,
          valY: 19,
          color: 'blue',
        });

        clock.restore();
      });
    });

    describe('on the bottom left corner', () => {
      it('should highlight the first point on the first line', () => {
        expect.assertions(1);
        const clock = sinon.useFakeTimers();

        const [, onMouseMove] = hookResult;

        act(() => {
          onMouseMove({
            pageX: 0,
            pageY: 0,
            currentTarget,
          });

          clock.tick(11);

          onMouseMove({
            pageX: 13 + 3,
            pageY: 25 + 90 - 2,
            currentTarget,
          });
        });

        const [hlPointAfter] = hookResult;
        expect(hlPointAfter).toStrictEqual({
          valX: 0,
          valY: 0,
          color: 'red',
        });

        clock.restore();
      });
    });

    describe('in the middle of the graph', () => {
      it('should highlight the closest line point', () => {
        expect.assertions(1);
        const clock = sinon.useFakeTimers();

        const [, onMouseMove] = hookResult;

        act(() => {
          onMouseMove({
            pageX: 0,
            pageY: 0,
            currentTarget,
          });

          clock.tick(11);

          onMouseMove({
            pageX: 13 + 43,
            pageY: 25 + 37,
            currentTarget,
          });
        });

        const [hlPointAfter] = hookResult;
        expect(hlPointAfter).toStrictEqual({
          valX: 2,
          valY: 4,
          color: 'red',
        });

        clock.restore();
      });
    });
  });

  describe('onMouseLeave', () => {
    it('should reset hlPoint', () => {
      expect.assertions(2);
      const clock = sinon.useFakeTimers();

      const [, onMouseMove, onMouseLeave] = hookResult;

      act(() => {
        onMouseMove({
          pageX: 0,
          pageY: 0,
          currentTarget,
        });

        clock.tick(11);

        onMouseMove({
          pageX: 13 + 43,
          pageY: 25 + 37,
          currentTarget,
        });
        clock.tick(3);
      });

      const [hlPointBefore] = hookResult;
      expect(hlPointBefore).not.toBeUndefined();

      act(() => {
        onMouseLeave();

        clock.tick(8);
      });

      const [hlPointAfter] = hookResult;

      expect(hlPointAfter).toBeUndefined();
    });
  });
});