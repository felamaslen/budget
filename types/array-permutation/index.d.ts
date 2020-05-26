declare module 'array-permutation' {
  function* permutation<T>(items: T[]): Generator<T[]>;

  export default permutation;
}
