"use strict";

const accountBalance = require("../controllers/accountBalanceController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/account-balance')
        .post(verifyToken, catchError(accountBalance.createAccountBalance))
        .put(verifyToken, catchError(accountBalance.updateAccountBalance))

    app.route('/api/account-balance/:id')
        .get(verifyToken, catchError(accountBalance.getAccountBalance))
        .delete(verifyToken, catchError(accountBalance.deleteAccountBalance))
        .post(verifyToken, catchError(accountBalance.activateAccountBalance))

    app.route('/api/account-balances/opening-closing').get(verifyToken, catchError(accountBalance.getOpeningAndClosingWithExactDate))
    app.route('/api/account-balances/entry').get(verifyToken, catchError(accountBalance.balanceSheetEntry))
    app.route('/api/account-balances').get(verifyToken, catchError(accountBalance.listAllAccountBalances))
    app.route('/api/account-balances/closing').get(verifyToken, catchError(accountBalance.getClosing))

};
