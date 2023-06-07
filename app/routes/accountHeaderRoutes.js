"use strict";

const accountHeader = require("../controllers/accountHeaderController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/account-header')
        .post( catchError(accountHeader.createAccountHeader))
        .put( catchError(accountHeader.updateAccountHeader))

    app.route('/api/account-header/:id')
        .get( catchError(accountHeader.getAccountHeader))
        .delete( catchError(accountHeader.deleteAccountHeader))
        .post( catchError(accountHeader.activateAccountHeader))

    app.route('/api/account-headers').get( catchError(accountHeader.listAllAccountHeaders))
    app.route('/api/account-headers/related/:id').get( catchError(accountHeader.getRelatedAccountHeader))
};
