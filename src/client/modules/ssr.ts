export const getIsServerSide = (): boolean => process.env.IS_CLIENT !== 'true';
