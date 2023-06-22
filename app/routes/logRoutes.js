"use strict";

const log = require("../controllers/logController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {
    app.route('/api/logs').get( verifyToken, catchError(log.listAllLog))
    app.route('/api/logs/filter').get( verifyToken, catchError(log.filterLogs))
    app.route('/api/logs/usage').post(verifyToken, catchError(log.createUsage))
};
