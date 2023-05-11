"use strict";

const repayment = require("../controllers/repaymentController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/repayment')
        .post(catchError(repayment.createRepayment))
        .put(catchError(repayment.updateRepayment))
        
    app.route('/api/repayment/:id')
        .get( catchError(repayment.getRepayment))
        .delete(catchError(repayment.deleteRepayment)) 
        .post( catchError(repayment.activateRepayment))

    app.route('/api/repayments').get(catchError(repayment.listAllRepayments))
    app.route('/api/repayments/:relatedPateintTreatmentid').get(catchError(repayment.getRelatedPayment))
};
