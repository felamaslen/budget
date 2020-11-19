import config from '~api/config';

export type AppConfig = {
  birthDate: string;
  pieTolerance: number;
};

export const getAppConfig = (): AppConfig => ({
  birthDate: config.data.overview.birthDate,
  pieTolerance: config.data.pie.tolerance,
});
