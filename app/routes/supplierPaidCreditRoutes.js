"use strict";

const supplierPaidCredit = require("../controllers/supplierPaidCreditController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/supplier-paid-credit')
        .post(catchError(supplierPaidCredit.createSupplierPaidCredit))
        .put(catchError(supplierPaidCredit.updateSupplierPaidCredit))
        
    app.route('/api/supplier-paid-credit/:id')
        .get(catchError(supplierPaidCredit.getSupplierPaidCredit))
        .delete(catchError(supplierPaidCredit.deleteSupplierPaidCredit)) 
        .post(catchError(supplierPaidCredit.activateSupplierPaidCredit))

    app.route('/api/supplier-paid-credits').get(catchError(supplierPaidCredit.listAllSupplierPaidCredits))
};
