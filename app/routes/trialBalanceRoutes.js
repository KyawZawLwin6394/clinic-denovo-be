"use strict";

const trialBalance = require("../controllers/trialBalanceController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/trial-balance')
        .get(catchError(trialBalance.trialBalance))
        
    app.route('/api/trial-balance/type')
        .get( catchError(trialBalance.trialBalanceWithType))
};
