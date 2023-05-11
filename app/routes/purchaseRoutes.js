"use strict";

const purchase = require("../controllers/purchaseController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/purchase')
        .post(catchError(purchase.createPurchase))
        .put(catchError(purchase.updatePurchase))
        
    app.route('/api/purchase/:id')
        .get(catchError(purchase.getPurchase))
        .delete(catchError(purchase.deletePurchase)) 
        .post(catchError(purchase.activatePurchase))

    app.route('/api/purchases').get(catchError(purchase.listAllPurchases))
};
