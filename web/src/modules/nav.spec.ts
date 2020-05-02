import { KeyboardEvent } from 'react';

import { getNavDirection, Direction } from './nav';

describe('Navigation module', () => {
  describe('Direction', () => {
    it('should describe each direction accurately', () => {
      expect.assertions(5);

      expect(Direction.identity).toStrictEqual({ dx: 0, dy: 0 });
      expect(Direction.up).toStrictEqual({ dx: 0, dy: -1 });
      expect(Direction.down).toStrictEqual({ dx: 0, dy: 1 });
      expect(Direction.left).toStrictEqual({ dx: -1, dy: 0 });
      expect(Direction.right).toStrictEqual({ dx: 1, dy: 0 });
    });
  });

  describe('getNavDirection', () => {
    it('should handle tabs', () => {
      expect.assertions(1);
      const event = {
        key: 'Tab',
        shiftKey: false,
      } as KeyboardEvent;

      expect(getNavDirection(event)).toStrictEqual({ dx: 1, dy: 0 });
    });

    it('should handle reverse tabs', () => {
      expect.assertions(1);
      const event = {
        key: 'Tab',
        shiftKey: true,
      } as KeyboardEvent;

      expect(getNavDirection(event)).toStrictEqual({ dx: -1, dy: 0 });
    });

    it('should handle arrows', () => {
      expect.assertions(4);

      expect(getNavDirection({ key: 'ArrowUp' } as KeyboardEvent)).toBe(Direction.up);
      expect(getNavDirection({ key: 'ArrowRight' } as KeyboardEvent)).toBe(Direction.right);
      expect(getNavDirection({ key: 'ArrowDown' } as KeyboardEvent)).toBe(Direction.down);
      expect(getNavDirection({ key: 'ArrowLeft' } as KeyboardEvent)).toBe(Direction.left);
    });

    it('should optionally require ctrl modifier with arrows', () => {
      expect.assertions(8);

      expect(getNavDirection({ key: 'ArrowUp' } as KeyboardEvent, true)).toBe(Direction.identity);
      expect(getNavDirection({ key: 'ArrowRight' } as KeyboardEvent, true)).toBe(
        Direction.identity,
      );
      expect(getNavDirection({ key: 'ArrowDown' } as KeyboardEvent, true)).toBe(Direction.identity);
      expect(getNavDirection({ key: 'ArrowLeft' } as KeyboardEvent, true)).toBe(Direction.identity);

      expect(getNavDirection({ ctrlKey: true, key: 'ArrowUp' } as KeyboardEvent, true)).toBe(
        Direction.up,
      );

      expect(getNavDirection({ ctrlKey: true, key: 'ArrowRight' } as KeyboardEvent, true)).toBe(
        Direction.right,
      );
      expect(getNavDirection({ ctrlKey: true, key: 'ArrowDown' } as KeyboardEvent, true)).toBe(
        Direction.down,
      );
      expect(getNavDirection({ ctrlKey: true, key: 'ArrowLeft' } as KeyboardEvent, true)).toBe(
        Direction.left,
      );
    });

    it('should ignore other events', () => {
      expect.assertions(1);
      expect(getNavDirection({ key: 'A' } as KeyboardEvent)).toBe(Direction.identity);
    });
  });
});
