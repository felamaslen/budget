/**
 * API endpoints for backend
 */

const config = require('./config.js')();

const routes = require('./routes');

function apiRouter(app) {
    routes(app);

    app.use((req, res) => {
        // catch-all api endpoint
        const response = {
            error: true,
            errorMessage: config.msg.unknownApiEndpoint,
            url: req.url
        };
        res.status(400).json(response);
    });

    return app;
}

module.exports = apiRouter;

