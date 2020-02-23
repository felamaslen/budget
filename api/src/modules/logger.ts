import winston from 'winston';

const getLevel = (): 'info' | 'debug' | 'verbose' => {
  if (process.env.NODE_ENV === 'production') {
    return 'info';
  }
  if (process.env.NODE_ENV === 'development') {
    return 'debug';
  }

  return 'verbose';
};

const { format, transports } = winston;

const logger = winston.createLogger({
  level: getLevel(),
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new transports.Console({
      format: format.combine(format.timestamp(), format.colorize(), format.simple()),
      silent: process.env.NODE_ENV === 'test',
    }),
  ],
});

export default logger;
