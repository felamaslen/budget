/**
 * API endpoints for backend
 */

const config = require('./config.js')();

const user = require('./routes/user');

function apiRouter(app) {
    // TODO: middleware to redirect old requests to the new API format

    app.post('/user/login', (req, res) => user.login(req, res));

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

