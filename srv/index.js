/**
 * Express API and web server
 */

const express = require('express');
const path = require('path');
const version = require('../package.json').version;

// initiate express web server
const app = express();

// set up template engine
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '../web/build')));

app.get('/api', (req, res) => {
  res.send('Budget API dummy endpoint'); // TODO
});

// load home (app) page by default
app.get('/', (req, res) => {
  const pieTolerance = process.env.PIE_TOLERANCE || 0.075;
  res.render('index', {
    version,
    pieTolerance
  });
});

// error handling
app.get('*', (req, res) => {
  res.status(404).send('File not found');
});

// listen to web requests
const port = process.env.PORT || 3000;
app.listen(port);
console.log(`App is listening on port ${port}!`);

