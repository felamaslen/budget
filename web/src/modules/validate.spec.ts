import { validateField } from './validate';

describe('Validate module', () => {
  describe('validateField', () => {
    it("should validate that an item field isn't empty", () => {
      expect.assertions(2);
      expect(() => validateField('item', '')).toThrowErrorMatchingInlineSnapshot(`"Required"`);
      expect(() => validateField('item', 'foo')).not.toThrow();
    });
    it("should validate that a category field isn't empty", () => {
      expect.assertions(2);
      expect(() => validateField('category', '')).toThrowErrorMatchingInlineSnapshot(`"Required"`);
      expect(() => validateField('category', 'foo')).not.toThrow();
    });
    it("should validate that a holiday field isn't empty", () => {
      expect.assertions(2);
      expect(() => validateField('holiday', '')).toThrowErrorMatchingInlineSnapshot(`"Required"`);
      expect(() => validateField('holiday', 'foo')).not.toThrow();
    });
    it("should validate that a social field isn't empty", () => {
      expect.assertions(2);
      expect(() => validateField('social', '')).toThrowErrorMatchingInlineSnapshot(`"Required"`);
      expect(() => validateField('social', 'foo')).not.toThrow();
    });
    it("should validate that a shop field isn't empty", () => {
      expect.assertions(2);
      expect(() => validateField('shop', '')).toThrowErrorMatchingInlineSnapshot(`"Required"`);
      expect(() => validateField('shop', 'foo')).not.toThrow();
    });

    it('should validate dates', () => {
      expect.assertions(3);
      expect(() => validateField('date')).toThrowErrorMatchingInlineSnapshot(
        `"Must be a valid date"`,
      );
      expect(() =>
        validateField('date', new Date('not a date')),
      ).toThrowErrorMatchingInlineSnapshot(`"Must be a valid date"`);
      expect(() => validateField('date', new Date())).not.toThrow();
    });

    it('should validate costs', () => {
      expect.assertions(3);
      expect(() => validateField('cost', null)).toThrowErrorMatchingInlineSnapshot(
        `"Must be a number"`,
      );
      expect(() => validateField('cost', undefined)).toThrowErrorMatchingInlineSnapshot(
        `"Must be a number"`,
      );
      expect(() => validateField('cost', 461)).not.toThrow();
    });
  });
});
