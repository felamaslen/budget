import { act, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import React, { RefObject } from 'react';
import { useHover, HookResult, HLPoint, HoverEffect, Props } from './hover';
import { genPixelCompute } from '~client/components/graph/helpers';

describe('Hover hook', () => {
  const MyLabel: HoverEffect['Label'] = ({ main: { point } }) => (
    <span>
      {point[0].toFixed(2)},{point[1].toFixed(2)}
    </span>
  );

  const graphRef: RefObject<HTMLDivElement> = {
    current: {
      getBoundingClientRect: (): DOMRect =>
        ({
          left: 13,
          top: 25,
        } as DOMRect),
    } as HTMLDivElement,
  };

  let hookResult: RenderHookResult<unknown, HookResult | null>;
  beforeEach(() => {
    const hookProps: Props = {
      lines: [
        {
          key: 'line-a',
          name: 'Line A',
          data: [
            [0, 0],
            [1, 1],
            [2, 4],
            [3, 9],
          ],
          color: 'red',
          strokeWidth: 3,
          dashed: true,
          fill: true,
          smooth: true,
          movingAverage: { period: 2, color: 'darkred' },
        },
        {
          key: 'line-c',
          name: 'Line C',
          data: [
            [0, 3],
            [1, 2],
            [2, 14],
            [4, 17],
          ],
          hover: false,
          color: 'turquoise',
        },
        {
          key: 'line-b',
          name: 'Line B',
          data: [
            [0, 19],
            [0.5, 0.5],
            [4, 0],
          ],
          color: 'blue',
          strokeWidth: 1,
          smooth: false,
          secondary: true,
        },
      ],
      isMobile: false,
      graphRef,
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
        Label: MyLabel,
      },
    };

    hookResult = renderHook(() => useHover(hookProps));
  });
  afterEach(() => {
    hookResult.unmount();
  });

  describe('hlPoint', () => {
    it('should initially be undefined', () => {
      expect.assertions(1);
      expect(hookResult.result.current?.hlPoint).toBeUndefined();
    });
  });

  describe('onMouseMove', () => {
    describe('on the top left corner', () => {
      it('should highlight the first point on the second line', () => {
        expect.assertions(2);
        jest.useFakeTimers();

        const hlPointBefore = hookResult.result.current?.hlPoint;
        expect(hlPointBefore).toBeUndefined();

        act(() => {
          hookResult.result.current?.events.onMouseMove?.({
            pageX: 0,
            pageY: 0,
          } as React.MouseEvent<HTMLDivElement>);
        });

        act(() => {
          jest.advanceTimersByTime(11);
        });

        act(() => {
          hookResult.result.current?.events.onMouseMove?.({
            pageX: 13 + 3,
            pageY: 25 + 1,
          } as React.MouseEvent<HTMLDivElement>);
        });

        const hlPointAfter = hookResult.result.current?.hlPoint;
        expect(hlPointAfter).toStrictEqual(
          expect.objectContaining<Partial<HLPoint>>({
            main: { point: [0, 19], unstackedPoint: [0, 19] },
            color: 'blue',
            secondary: true,
          }),
        );
      });
    });

    describe('on the bottom left corner', () => {
      it('should highlight the first point on the first line', () => {
        expect.assertions(1);
        jest.useFakeTimers();

        act(() => {
          hookResult.result.current?.events.onMouseMove?.({
            pageX: 0,
            pageY: 0,
          } as React.MouseEvent<HTMLDivElement>);

          jest.advanceTimersByTime(11);

          hookResult.result.current?.events.onMouseMove?.({
            pageX: 13 + 3,
            pageY: 25 + 90 - 2,
          } as React.MouseEvent<HTMLDivElement>);
        });

        const hlPointAfter = hookResult.result.current?.hlPoint;
        expect(hlPointAfter).toStrictEqual(
          expect.objectContaining<Partial<HLPoint>>({
            main: { point: [0, 0], unstackedPoint: [0, 0] },
            color: 'red',
            secondary: undefined,
          }),
        );
      });
    });

    describe('in the middle of the graph', () => {
      it('should highlight the closest line point', () => {
        expect.assertions(1);
        jest.useFakeTimers();

        act(() => {
          hookResult.result.current?.events.onMouseMove?.({
            pageX: 0,
            pageY: 0,
          } as React.MouseEvent<HTMLDivElement>);

          jest.advanceTimersByTime(11);

          hookResult.result.current?.events.onMouseMove?.({
            pageX: 13 + 43,
            pageY: 25 + 37,
          } as React.MouseEvent<HTMLDivElement>);
        });

        const hlPointAfter = hookResult.result.current?.hlPoint;
        expect(hlPointAfter).toStrictEqual(
          expect.objectContaining<Partial<HLPoint>>({
            main: { point: [2, 4], unstackedPoint: [2, 4] },
            color: 'red',
          }),
        );
      });
    });

    describe('when a line is set not to hover', () => {
      it('should not highlight a point on the line', () => {
        expect.assertions(2);
        jest.useFakeTimers();

        const hlPointBefore = hookResult.result.current?.hlPoint;
        expect(hlPointBefore).toBeUndefined();

        act(() => {
          hookResult.result.current?.events.onMouseMove?.({
            pageX: 0,
            pageY: 0,
          } as React.MouseEvent<HTMLDivElement>);

          jest.advanceTimersByTime(11);

          hookResult.result.current?.events.onMouseMove?.({
            pageX: 100,
            pageY: 0,
          } as React.MouseEvent<HTMLDivElement>);
        });

        const hlPointAfter = hookResult.result.current?.hlPoint;
        expect(hlPointAfter).not.toStrictEqual(
          expect.objectContaining<Partial<HLPoint>>({
            main: { point: [4, 17], unstackedPoint: [4, 17] },
            color: 'turquoise',
          }),
        );
      });
    });
  });

  describe('onMouseLeave', () => {
    it('should reset hlPoint', () => {
      expect.assertions(2);
      jest.useFakeTimers();

      act(() => {
        hookResult.result.current?.events.onMouseMove?.({
          pageX: 0,
          pageY: 0,
        } as React.MouseEvent<HTMLDivElement>);

        jest.advanceTimersByTime(11);

        hookResult.result.current?.events.onMouseMove?.({
          pageX: 13 + 43,
          pageY: 25 + 37,
        } as React.MouseEvent<HTMLDivElement>);
        jest.advanceTimersByTime(3);
      });

      const hlPointBefore = hookResult.result.current?.hlPoint;
      expect(hlPointBefore).not.toBeUndefined();

      act(() => {
        hookResult.result.current?.events.onMouseLeave?.({} as React.MouseEvent<HTMLDivElement>);

        jest.advanceTimersByTime(8);
      });

      const hlPointAfter = hookResult.result.current?.hlPoint;

      expect(hlPointAfter).toBeUndefined();
    });
  });
});
