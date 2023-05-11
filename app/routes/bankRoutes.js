"use strict";

const bank = require("../controllers/bankController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/bank')
        .post(catchError(bank.createBank))
        .put(catchError(bank.updateBank))
        
    app.route('/api/bank/:id')
        .get(catchError(bank.getBank))
        .delete(catchError(bank.deleteBank)) 
        .post(catchError(bank.activateBank))

    app.route('/api/banks').get(catchError(bank.listAllBanks))
};
