/**
 * API endpoints for backend
 */

'use strict';

require('dotenv').config();
const config = require('./config.js');

function filterLastMonths(numMonths, ref) {
  const yearRef = ref.getFullYear();
  const monthRef = ref.getMonth();

  const monthBegin = (((monthRef - numMonths) % 12) + 12) % 12;
  const yearBegin = yearRef + Math.floor((monthRef - numMonths) / 12);

  return { yearBegin, monthBegin, yearRef, monthRef };
}

class ApiData {
  constructor(db) {
    this.db = db;
    this.table = null;
  }
  request() {
    return null;
  }
  run(req, res) {
    this.request().then(data => {
      res.json({
        error: false,
        data
      });
    });
  }
}

class ApiDataGet extends ApiData {
  request() {
    const response = {};

    return new Promise(resolve => {
      // filter the collection to include data from the last three months
      const yearMonthRange = filterLastMonths(2, new Date());

      this.db.collection(this.table).find({
        $or: [
          {
            'date.0': { $gt: yearMonthRange.yearBegin },
          },
          {
            $and: [
              { 'date.0': { $eq: yearMonthRange.yearBegin } },
              { 'date.1': { $gte: yearMonthRange.monthBegin } }
            ]
          }
        ]
      }).toArray((err, results) => {
        if (err) {
          throw err;
        }
        const rows = results.map(row => {
          return {
            I: row._id, // TODO: short id
            d: row.date,
            i: row.item,
            c: row.cost
          };
        });

        response.data = rows;
        response.total = rows.reduce((last, item) => {
          return last + item.c;
        }, 0);

        resolve(response);
      });
    });
  }
}

class ApiDataGetIncome extends ApiDataGet {
  constructor(db) {
    super(db);
    this.table = 'income';
  }
}

module.exports = {
  ApiDataGetIncome,
  filterLastMonths
};

