/**
 * API endpoints for backend
 */

'use strict';

require('dotenv').config();
const config = require('./config.js');

class ApiData {
  constructor(db) {
    this.db = db;
    this.data = {};
  }
  run(req, res) {
    res.json({
      error: false,
      data: this.data
    });
  }
}

class ApiDataGet extends ApiData {
}

class ApiDataPost extends ApiData {
}

class ApiDataGetBills extends ApiDataGet {
}

module.exports = {
  ApiDataGetBills
};

