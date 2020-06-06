export * from './analysis';
export * from './funds';
export * from './overview';
export * from './search';
export * from './shared';
export * from './user';

export type Create<V> = Omit<V, 'id'>;
