function catchAsyncErrors(handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (err) {
            console.log('next with err', err.message);
            next(err);
        }
    };
}

function errorHandler(logger) {
    // eslint-disable-next-line no-unused-vars
    return (err, req, res, next) => {
        if (err.status) {
            res.status(err.status);
        } else {
            logger.warn('Unhandled API error:', err.stack);

            res.status(500);
        }

        res.json({
            err: err.message
        });
    };
}

module.exports = {
    catchAsyncErrors,
    errorHandler
};
