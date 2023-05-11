"use strict";

const transfer = require("../controllers/transferController");
const { catchError } = require("../lib/errorHandler");
const  verifyToken= require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/transfer')
        .post(catchError(transfer.createTransfer))
        .put( catchError(transfer.updateTransfer))
        
    app.route('/api/transfer/:id')
        .get(catchError(transfer.getTransfer))
        .delete(catchError(transfer.deleteTransfer)) 
        .post(catchError(transfer.activateTransfer))

    app.route('/api/transfers').get(catchError(transfer.listAllTransfers))

};
