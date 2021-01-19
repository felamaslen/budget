import { render, act } from '@testing-library/react';
import React, { RefObject, useRef } from 'react';
import sinon from 'sinon';
import { useHover, HookResult, HLPoint, HoverEffect } from './hover';
import { genPixelCompute } from '~client/components/graph/helpers';

describe('Hover hook', () => {
  const MyLabel: HoverEffect['Label'] = ({ main: { point } }) => (
    <span>
      {point[0].toFixed(2)},{point[1].toFixed(2)}
    </span>
  );

  let hookResult: HookResult | null;
  let graphRef: RefObject<HTMLDivElement>;
  const TestHook: React.FC = () => {
    graphRef = useRef<HTMLDivElement>(null);
    hookResult = useHover({
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
          arrows: false,
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
          arrows: false,
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
    });

    return <div ref={graphRef} />;
  };

  beforeEach(() => {
    render(<TestHook />);
    if (graphRef.current) {
      jest.spyOn(graphRef.current, 'getBoundingClientRect').mockReturnValueOnce({
        left: 13,
        top: 25,
      } as DOMRect);
    }
  });

  describe('hlPoint', () => {
    it('should initially be undefined', () => {
      expect.assertions(1);
      expect(hookResult?.hlPoint).toBeUndefined();
    });
  });

  describe('onMouseMove', () => {
    describe('on the top left corner', () => {
      it('should highlight the first point on the second line', () => {
        expect.assertions(2);
        const clock = sinon.useFakeTimers();

        const hlPointBefore = hookResult?.hlPoint;
        expect(hlPointBefore).toBeUndefined();

        act(() => {
          hookResult?.events.onMouseMove?.({
            pageX: 0,
            pageY: 0,
          } as React.MouseEvent<HTMLDivElement>);

          clock.tick(11);

          hookResult?.events.onMouseMove?.({
            pageX: 13 + 3,
            pageY: 25 + 1,
          } as React.MouseEvent<HTMLDivElement>);
        });

        const hlPointAfter = hookResult?.hlPoint;
        expect(hlPointAfter).toStrictEqual(
          expect.objectContaining<Partial<HLPoint>>({
            main: { point: [0, 19], unstackedPoint: [0, 19] },
            color: 'blue',
            secondary: true,
          }),
        );

        clock.restore();
      });
    });

    describe('on the bottom left corner', () => {
      it('should highlight the first point on the first line', () => {
        expect.assertions(1);
        const clock = sinon.useFakeTimers();

        act(() => {
          hookResult?.events.onMouseMove?.({
            pageX: 0,
            pageY: 0,
          } as React.MouseEvent<HTMLDivElement>);

          clock.tick(11);

          hookResult?.events.onMouseMove?.({
            pageX: 13 + 3,
            pageY: 25 + 90 - 2,
          } as React.MouseEvent<HTMLDivElement>);
        });

        const hlPointAfter = hookResult?.hlPoint;
        expect(hlPointAfter).toStrictEqual(
          expect.objectContaining<Partial<HLPoint>>({
            main: { point: [0, 0], unstackedPoint: [0, 0] },
            color: 'red',
            secondary: undefined,
          }),
        );

        clock.restore();
      });
    });

    describe('in the middle of the graph', () => {
      it('should highlight the closest line point', () => {
        expect.assertions(1);
        const clock = sinon.useFakeTimers();

        act(() => {
          hookResult?.events.onMouseMove?.({
            pageX: 0,
            pageY: 0,
          } as React.MouseEvent<HTMLDivElement>);

          clock.tick(11);

          hookResult?.events.onMouseMove?.({
            pageX: 13 + 43,
            pageY: 25 + 37,
          } as React.MouseEvent<HTMLDivElement>);
        });

        const hlPointAfter = hookResult?.hlPoint;
        expect(hlPointAfter).toStrictEqual(
          expect.objectContaining<Partial<HLPoint>>({
            main: { point: [2, 4], unstackedPoint: [2, 4] },
            color: 'red',
          }),
        );

        clock.restore();
      });
    });

    describe('when a line is set not to hover', () => {
      it('should not highlight a point on the line', () => {
        expect.assertions(2);
        const clock = sinon.useFakeTimers();

        const hlPointBefore = hookResult?.hlPoint;
        expect(hlPointBefore).toBeUndefined();

        act(() => {
          hookResult?.events.onMouseMove?.({
            pageX: 0,
            pageY: 0,
          } as React.MouseEvent<HTMLDivElement>);

          clock.tick(11);

          hookResult?.events.onMouseMove?.({
            pageX: 100,
            pageY: 0,
          } as React.MouseEvent<HTMLDivElement>);
        });

        const hlPointAfter = hookResult?.hlPoint;
        expect(hlPointAfter).not.toStrictEqual(
          expect.objectContaining<Partial<HLPoint>>({
            main: { point: [4, 17], unstackedPoint: [4, 17] },
            color: 'turquoise',
          }),
        );

        clock.restore();
      });
    });
  });

  describe('onMouseLeave', () => {
    it('should reset hlPoint', () => {
      expect.assertions(2);
      const clock = sinon.useFakeTimers();

      act(() => {
        hookResult?.events.onMouseMove?.({
          pageX: 0,
          pageY: 0,
        } as React.MouseEvent<HTMLDivElement>);

        clock.tick(11);

        hookResult?.events.onMouseMove?.({
          pageX: 13 + 43,
          pageY: 25 + 37,
        } as React.MouseEvent<HTMLDivElement>);
        clock.tick(3);
      });

      const hlPointBefore = hookResult?.hlPoint;
      expect(hlPointBefore).not.toBeUndefined();

      act(() => {
        hookResult?.events.onMouseLeave?.({} as React.MouseEvent<HTMLDivElement>);

        clock.tick(8);
      });

      const hlPointAfter = hookResult?.hlPoint;

      expect(hlPointAfter).toBeUndefined();
    });
  });
});
