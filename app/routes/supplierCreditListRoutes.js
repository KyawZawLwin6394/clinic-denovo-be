"use strict";

const supplierCreditList = require("../controllers/supplierCreditListController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/supplier-credit-list')
        .post(catchError(supplierCreditList.createSupplierCreditList))
        .put(catchError(supplierCreditList.updateSupplierCreditList))
        
    app.route('/api/supplier-credit-list/:id')
        .get(catchError(supplierCreditList.getSupplierCreditList))
        .delete(catchError(supplierCreditList.deleteSupplierCreditList)) 
        .post(catchError(supplierCreditList.activateSupplierCreditList))

    app.route('/api/supplier-credit-lists').get(catchError(supplierCreditList.listAllSupplierCreditLists))
};
