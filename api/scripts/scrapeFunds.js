/**
 * Script to scrape fund prices from broker
 */

const { logger } = require('./common');

function matchPartsRegex(parts, data) {
}

function getFundBroker(name) {
}

function processHoldingsData(data, broker, name) {
}

// Hargreaves Lansdown-specific processing functions
function processHoldingsHLFund(data) {
}
function processHoldingsHLShare(data) {
}
function HLFundIsShare(name) {
}

function getStockTickers() {
}
function saveStockTickers() {
}

function setupBrowser() {
    // this is required for spoofing a browser, so that sites
    // don't block our requests
}

function scrapeFundHoldings() {
}
function processHoldings() {
}
function saveHoldings() {
}

function getFundUrlHL(name) {
}
function getFundRawData(broker, name, hash) {
}
function scrapeFundPrice() {
}
function scrapeFundPrices() {
}
function processPrices() {
}

function addCacheItem(broker, hash, price) {
}

function run() {
    console.log('Scraping funds....');
}

if (require.main === module) {
    run();
}

module.exports = {
}

