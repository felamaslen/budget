import { identity } from '~/modules/utils';

test('identity returns the input unchanged', () => {
  expect(identity<string>('foo')).toBe('foo');

  type MyComplexType = {
    foo: string;
    bar: {
      baz: number;
    };
  };

  const myComplexThing: MyComplexType = {
    foo: 'yes',
    bar: {
      baz: 3,
    },
  };

  expect(identity<MyComplexType>(myComplexThing)).toBe(myComplexThing);
});
