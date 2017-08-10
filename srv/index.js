/**
 * Express API and web server
 */

const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '../web/build')));
app.use('/api', (req, res) => {
  res.send('Budget API dummy endpoint');
});

const port = process.env.PORT || 3000;

app.listen(port);
console.log(`App is listening on port ${port}!`);

