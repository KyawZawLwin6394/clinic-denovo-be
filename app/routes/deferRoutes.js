"use strict";

const defer = require("../controllers/deferController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/defer')
        .post(catchError(defer.createDefer))
        .put(catchError(defer.updateDefer))
        
    app.route('/api/defer/:id')
        .get( catchError(defer.getDefer))
        .delete(catchError(defer.deleteDefer)) 
        .post( catchError(defer.activateDefer))

    app.route('/api/defers').get(catchError(defer.listAllDefers))
};
