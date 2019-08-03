import winston from 'winston';

const getLevel = () => {
    if (process.env.NODE_ENV === 'production') {
        return 'info';
    }
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        return 'debug';
    }

    return 'verbose';
};

export default new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: getLevel(),
            json: false,
            colorize: true
        })
    ]
});
