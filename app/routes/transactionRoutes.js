 "use strict";

const transaction = require("../controllers/transactionController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/transaction')
        .post(verifyToken, catchError(transaction.createTransaction))
        .put(verifyToken, catchError(transaction.updateTransaction))

    app.route('/api/transactions/related/:id')
        .get (verifyToken, catchError(transaction.getRelatedTransaction))
        
    app.route('/api/transaction/:id')
        .get( verifyToken, catchError(transaction.getTransaction))
        .delete(verifyToken, catchError(transaction.deleteTransaction)) 
        .post(verifyToken, catchError(transaction.activateTransaction))

    app.route('/api/transactions').get(verifyToken, catchError(transaction.listAllTransactions))
    app.route('/api/transactions/trial-balance/:id').get(verifyToken, catchError(transaction.trialBalance))
};
