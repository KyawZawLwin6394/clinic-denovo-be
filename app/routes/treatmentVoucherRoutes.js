"use strict";

const treatmentVoucher = require("../controllers/treatmentVoucherController");
const { catchError } = require("../lib/errorHandler");
const  verifyToken= require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/treatment-voucher')
        .post( catchError(treatmentVoucher.createTreatmentVoucher))
        .put(catchError(treatmentVoucher.updateTreatmentVoucher))

    app.route('/api/treatment-voucher/:id')
        .get(catchError(treatmentVoucher.getTreatmentVoucher))
        .delete(catchError(treatmentVoucher.deleteTreatmentVoucher))
        .post(catchError(treatmentVoucher.activateTreatmentVoucher))

    app.route('/api/treatment-vouchers').get( catchError(treatmentVoucher.listAllTreatmentVouchers))
    app.route('/api/treatment-vouchers/search')
        .post(catchError(treatmentVoucher.searchTreatmentVoucher))
    app.route('/api/treatment-vouchers/filter')
        .post(catchError(treatmentVoucher.getRelatedTreatmentVoucher))
    app.route('/api/treatment-vouchers/code').get(catchError(treatmentVoucher.getCode))
    app.route('/api/treatment-vouchers/today').get(catchError(treatmentVoucher.getTodaysTreatmentVoucher))
    app.route('/api/treatment-vouchers/confirm').post(catchError(treatmentVoucher.confirmTransaction))
};
