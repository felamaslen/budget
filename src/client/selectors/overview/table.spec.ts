import { getOverviewTable } from './table';
import { testState } from '~client/test-data';

const now = new Date('2018-03-23T11:54:23.127Z');

describe('getOverviewTable', () => {
  it('should get the expected table structure', () => {
    expect.assertions(1);
    const table = getOverviewTable(now)(testState);

    expect(table).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          active: expect.any(Boolean),
          cells: expect.objectContaining({
            stocks: { rgb: expect.stringMatching(/^#[0-9a-f]{6}$/), value: expect.any(Number) },
            bills: { rgb: expect.stringMatching(/^#[0-9a-f]{6}$/), value: expect.any(Number) },
            food: { rgb: expect.stringMatching(/^#[0-9a-f]{6}$/), value: expect.any(Number) },
            general: { rgb: expect.stringMatching(/^#[0-9a-f]{6}$/), value: expect.any(Number) },
            holiday: { rgb: expect.stringMatching(/^#[0-9a-f]{6}$/), value: expect.any(Number) },
            social: { rgb: expect.stringMatching(/^#[0-9a-f]{6}$/), value: expect.any(Number) },
            income: { rgb: expect.stringMatching(/^#[0-9a-f]{6}$/), value: expect.any(Number) },
            spending: { rgb: expect.stringMatching(/^#[0-9a-f]{6}$/), value: expect.any(Number) },
            net: { rgb: expect.stringMatching(/^#[0-9a-f]{6}$/), value: expect.any(Number) },
            netWorth: { rgb: expect.stringMatching(/^#[0-9a-f]{6}$/), value: expect.any(Number) },
          }),
          month: expect.any(Number),
          year: expect.any(Number),
          monthText: expect.any(String),
          future: expect.any(Boolean),
          past: expect.any(Boolean),
        }),
      ]),
    );
  });

  it('should return the correct sequence of formatted months', () => {
    expect.assertions(1);
    const table = getOverviewTable(now)(testState);

    expect(table.map((row) => row.monthText)).toMatchInlineSnapshot(`
        Array [
          "Jan-18",
          "Feb-18",
          "Mar-18",
          "Apr-18",
          "May-18",
          "Jun-18",
          "Jul-18",
        ]
      `);
  });

  it('should return the correct 1-indexed month values', () => {
    expect.assertions(1);
    const table = getOverviewTable(now)(testState);

    expect(table.map((row) => row.month)).toMatchInlineSnapshot(`
        Array [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
        ]
      `);
  });

  it('should return the correct year', () => {
    expect.assertions(1);
    const table = getOverviewTable(now)(testState);

    expect(table.map((row) => row.year)).toMatchInlineSnapshot(`
        Array [
          2018,
          2018,
          2018,
          2018,
          2018,
          2018,
          2018,
        ]
      `);
  });

  it('should return the correct values for past and future', () => {
    expect.assertions(14);
    const table = getOverviewTable(now)(testState);

    expect(table[0].past).toBe(true); // Jan-18
    expect(table[0].future).toBe(false);

    expect(table[1].past).toBe(true); // Feb-18
    expect(table[1].future).toBe(false);

    expect(table[2].past).toBe(false); // Mar-18
    expect(table[2].future).toBe(false);

    expect(table[3].past).toBe(false); // Apr-18
    expect(table[3].future).toBe(true);

    expect(table[4].past).toBe(false); // May-18
    expect(table[4].future).toBe(true);

    expect(table[5].past).toBe(false); // Jun-18
    expect(table[5].future).toBe(true);

    expect(table[6].past).toBe(false); // Jul-18
    expect(table[6].future).toBe(true);
  });
});
