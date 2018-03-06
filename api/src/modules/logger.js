const winston = require('winston');

const getLevel = () => {
    if (process.env.NODE_ENV === 'production') {
        return 'info';
    }
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        return 'debug';
    }

    return 'verbose';
};

const getLogger = (suppress = false) => {
    if (suppress) {
        return new winston.Logger({ transports: [] });
    }

    return new winston.Logger({
        transports: [
            new winston.transports.Console({
                level: getLevel(),
                json: false,
                colorize: true
            })
        ]
    });
};

module.exports = getLogger;

