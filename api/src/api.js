/**
 * API endpoints for backend
 */

const config = require('./config.js')();

const user = require('./routes/user');
const data = require('./routes/data');
const search = require('./routes/search');

function apiRouter(app) {
    // user routes
    user.handler(app);

    // data routes
    data.handler(app);

    // search route
    search.handler(app);

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

