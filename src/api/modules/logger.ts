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
      format:
        process.env.NODE_ENV === 'production'
          ? format.combine(format.timestamp(), format.json())
          : format.combine(
              format.colorize(),
              format.splat(),
              format.timestamp(),
              format.printf(({ level, message, timestamp, ...metadata }) => {
                const msg = `${timestamp} [${level}]: ${message}`;
                if (Object.keys(metadata).length > 0) {
                  return `${msg} ${JSON.stringify(metadata)}`;
                }
                return msg;
              }),
            ),
      silent: process.env.NODE_ENV === 'test' && process.env.LOG_DEBUG !== 'true',
    }),
  ],
});

export default logger;
