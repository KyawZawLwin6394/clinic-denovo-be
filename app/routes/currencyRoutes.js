"use strict";

const currency = require("../controllers/currencyController");
const { catchError } = require("../lib/errorHandler");
const  verifyToken= require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/currency')
        .post( catchError(currency.createCurrency))
        .put(catchError(currency.updateCurrency))

    app.route('/api/currency/:id')
        .get(catchError(currency.getCurrency))
        .delete(catchError(currency.deleteCurrency))
        .post(catchError(currency.activateCurrency))

    app.route('/api/currencies').get( catchError(currency.listAllCurrencys))
};
