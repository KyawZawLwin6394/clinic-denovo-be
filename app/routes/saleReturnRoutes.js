"use strict";

const saleReturn = require("../controllers/saleReturnController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/sale-return')
        .post( catchError(saleReturn.createSaleReturn))
        .put( catchError(saleReturn.updateSaleReturn))

    app.route('/api/sale-return/:id')
        .get( catchError(saleReturn.getSaleReturn))
        .delete( catchError(saleReturn.deleteSaleReturn))
        .post( catchError(saleReturn.activateSaleReturn))

    app.route('/api/sale-returns').get( catchError(saleReturn.listAllSaleReturns))

};
