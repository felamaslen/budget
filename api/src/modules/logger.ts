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
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.splat(),
        format.printf((info) => `${info.level} [${info.timestamp}] ${info.message}`),
      ),
      silent: process.env.NODE_ENV === 'test',
    }),
  ],
});

export default logger;
