require('dotenv').config();
const config = require('../config.js');

const expect = require('chai').expect;

function apiTestData(db) {
  describe('overview', () => {
    it('should require authentication');
    it('should return valid data');
    it('should update data');
  });

  describe('analysis', () => {
    it('should require authentication');
    it('should be handled');
    it('should paginate');
    describe('time period', () => {
      it('should filter by year');
      it('should filter by month');
      it('should filter by week');
    });
    describe('category', () => {
      it('should filter by category');
      it('should filter by shop');
    });
    describe('deep filter', () => {
      it('should filter by table');
    });
  });

  describe('funds', () => {
    it('should require authentication');
    it('should get data without history');
    it('should get data with history');
    it('should get data with history limited by period');

    it('should insert data');

    it('should scrape price data');
    it('should scrape holdings data');
  });

  describe('income', () => {
    it('should require authentication');
    it('should get data');
    it('should insert data');
  });
  describe('bills', () => {
    it('should require authentication');
    it('should get data');
    it('should insert data');
  });
  describe('food', () => {
    it('should require authentication');
    it('should get data');
    it('should insert data');
  });
  describe('general', () => {
    it('should require authentication');
    it('should get data');
    it('should insert data');
  });
  describe('holiday', () => {
    it('should require authentication');
    it('should get data');
    it('should insert data');
  });
  describe('social', () => {
    it('should require authentication');
    it('should get data');
    it('should insert data');
  });

  describe('all', () => {
    it('should require authentication');
    it('should get all data');
  });
}

module.exports = apiTestData;

