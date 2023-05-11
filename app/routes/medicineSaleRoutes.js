"use strict";

const medicineSale = require("../controllers/medicineSaleController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/medicine-sale')
        .post(catchError(medicineSale.createMedicineSale))
        .put(catchError(medicineSale.updateMedicineSale))

        
    app.route('/api/medicine-sale/:id')
        .get(catchError(medicineSale.getMedicineSale))
        .delete(catchError(medicineSale.deleteMedicineSale)) 
        .post(catchError(medicineSale.activateMedicineSale))

    app.route('/api/medicine-sales').get(catchError(medicineSale.listAllMedicineSales))
    app.route('/api/medicine-sales/code').get(catchError(medicineSale.createCode))

    app.route('/api/medicine-sales/transaction').post(catchError(medicineSale.createMedicineSaleTransaction))

};
