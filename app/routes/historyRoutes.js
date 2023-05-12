"use strict";

const history = require("../controllers/historyController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/history')
        .post(catchError(history.createHistory))
        .put(catchError(history.updateHistory))

    app.route('/api/history/:id')
        .get(catchError(history.getHistory))
        .delete(catchError(history.deleteHistory))
        .post(catchError(history.activateHistory))

    app.route('/api/histories').get(catchError(history.listAllHistories))

    app.route('/api/histories-filter')
        .get(catchError(history.filterHistories))

    app.route('/api/histories-search')
        .post(catchError(history.searchHistories))
};
