"use strict";

const accountingList = require("../controllers/accountingListController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/accounting-list')
        .post( catchError(accountingList.createAccountingList))
        .put( catchError(accountingList.updateAccountingList))

    app.route('/api/accounting-list/:id')
        .get( catchError(accountingList.getAccountingList))
        .delete( catchError(accountingList.deleteAccountingList))
        .post( catchError(accountingList.activateAccountingList))

    app.route('/api/accounting-lists').get( catchError(accountingList.listAllAccountingLists))
    app.route('/api/accounting-lists/related/:id').get( catchError(accountingList.getAccountingListByRelatedHeader))
};
