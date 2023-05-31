"use strict";

const stockRequest = require("../controllers/stockRequestController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/stock-request')
        .post(catchError(stockRequest.createStockRequest))
        .put(catchError(stockRequest.updateStockRequest))

    app.route('/api/stock-request/:id')
        .get(catchError(stockRequest.getStockRequest))
        .delete(catchError(stockRequest.deleteStockRequest))
        .post(catchError(stockRequest.activateStockRequest))

    app.route('/api/stock-requests').get(catchError(stockRequest.listAllStockRequests))
    app.route('/api/stock-requests/code').get(catchError(stockRequest.generateCode))
};
