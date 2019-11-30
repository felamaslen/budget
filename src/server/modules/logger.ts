import { createLogger, Logger, LoggerOptions, format, transports } from 'winston';
import config from '~/server/config';

const options = (label?: string): LoggerOptions => {
    const labelFormatted = label ? ` [${label}]` : '';

    return {
        level: config.logLevel,
        transports: [
            new transports.Console({
                format: format.combine(
                    format.timestamp(),
                    format.colorize(),
                    format.splat(),
                    format.printf(
                        ({ timestamp, level, message }) =>
                            `[${timestamp}] ${level}:${labelFormatted} ${message}`,
                    ),
                ),
            }),
        ],
    };
};

export const logger: Logger = createLogger(options());

export const getLogger = (label?: string): Logger => createLogger(options(label));
