"use strict";

const supplier = require("../controllers/supplierController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/supplier')
        .post(catchError(supplier.createSupplier))
        .put(catchError(supplier.updateSupplier))
        
    app.route('/api/supplier/:id')
        .get(catchError(supplier.getSupplier))
        .delete(catchError(supplier.deleteSupplier)) 
        .post(catchError(supplier.activateSupplier))

    app.route('/api/suppliers').get(catchError(supplier.listAllSuppliers))

    app.route('/api/suppliers/pay').put(catchError(supplier.paySupplier))
};
