"use strict";

const treatmentVoucher = require("../controllers/treatmentVoucherController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/treatment-voucher')
        .post(verifyToken, catchError(treatmentVoucher.createTreatmentVoucher))
        .put(verifyToken, catchError(treatmentVoucher.updateTreatmentVoucher))

    app.route('/api/treatment-voucher/:id')
        .get(verifyToken, catchError(treatmentVoucher.getTreatmentVoucher))
        .delete(verifyToken, catchError(treatmentVoucher.deleteTreatmentVoucher))
        .post(verifyToken, catchError(treatmentVoucher.activateTreatmentVoucher))

    app.route('/api/treatment-vouchers')
    .get(verifyToken, catchError(treatmentVoucher.listAllTreatmentVouchers))
    app.route('/api/treatment-vouchers/search')
        .post(verifyToken, catchError(treatmentVoucher.searchTreatmentVoucher))
    app.route('/api/treatment-vouchers/filter')
        .post(verifyToken, catchError(treatmentVoucher.getRelatedTreatmentVoucher))
    app.route('/api/treatment-vouchers/code').get(verifyToken, catchError(treatmentVoucher.getCode))
    app.route('/api/treatment-vouchers/today').get(verifyToken, catchError(treatmentVoucher.getTodaysTreatmentVoucher))
    app.route('/api/treatment-vouchers/get-date').get(verifyToken, catchError(treatmentVoucher.getwithExactDate))
    app.route('/api/treatment-vouchers/TV-Filter').get(verifyToken, catchError(treatmentVoucher.TreatmentVoucherFilter))
    app.route('/api/treatment-vouchers/treatment-selection/:id').get(verifyToken, catchError(treatmentVoucher.getTreatmentVoucherWithTreatmentID))
    app.route('/api/treatment-vouchers/ms/single').post(verifyToken, catchError(treatmentVoucher.createSingleMedicineSale))
    app.route('/api/treatment-vouchers/ms/combine').put(verifyToken, catchError(treatmentVoucher.combineMedicineSale))
};
