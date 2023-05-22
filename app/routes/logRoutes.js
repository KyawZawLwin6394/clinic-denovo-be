"use strict";

const log = require("../controllers/logController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {
    app.route('/api/logs').get( catchError(log.listAllLog))
    app.route('/api/logs/filter').get( catchError(log.filterLogs))
    app.route('/api/logs/usage').post(catchError(log.createUsage))
};
