"use strict";

const stockTransfer = require("../controllers/stockTransferController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/stock-transfer')
        .post(catchError(stockTransfer.createStockTransfer))
        .put(catchError(stockTransfer.updateStockTransfer))

    app.route('/api/stock-transfer/:id')
        .get(catchError(stockTransfer.getStockTransfer))
        .delete(catchError(stockTransfer.deleteStockTransfer))
        .post(catchError(stockTransfer.activateStockTransfer))

    app.route('/api/stock-transfers').get(catchError(stockTransfer.listAllStockRequests))
    app.route('/api/stock-transfers/code').get(catchError(stockTransfer.generateCode))
};
