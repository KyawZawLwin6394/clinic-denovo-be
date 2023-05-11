"use strict";

const cash = require("../controllers/cashController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/cash')
        .post(catchError(cash.createCash))
        .put(catchError(cash.updateCash))
        
    app.route('/api/cash/:id')
        .get(catchError(cash.getCash))
        .delete(catchError(cash.deleteCash)) 
        .post(catchError(cash.activateCash))


    app.route('/api/cashes').get( catchError(cash.listAllCashes))

};
