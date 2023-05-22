"use strict";

const treatment = require("../controllers/treatmentController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/treatment')
        .post(catchError(treatment.createTreatment))
        .put(catchError(treatment.updateTreatment))

    app.route('/api/treatment/:id')
        .get(catchError(treatment.getTreatment))
        .delete(catchError(treatment.deleteTreatment))
        .post(catchError(treatment.activateTreatment))

    app.route('/api/treatments').get(catchError(treatment.listAllTreatments))
    app.route('/api/treatment-search').post(catchError(treatment.searchTreatments))
    app.route('/api/treatments/list/:id').get(catchError(treatment.getRelatedTreatmentByTreatmentListID))
};
