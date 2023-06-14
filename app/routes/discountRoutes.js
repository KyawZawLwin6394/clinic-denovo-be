"use strict";

const discount = require("../controllers/discountController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/discount')
        .post( catchError(discount.createDiscount))
        .put( catchError(discount.updateDiscount))

    app.route('/api/discount/:id')
        .get( catchError(discount.getDiscount))
        .delete( catchError(discount.deleteDiscount))
        .post( catchError(discount.activateDiscount))

    app.route('/api/discounts').get( catchError(discount.listAllDiscounts))

};
