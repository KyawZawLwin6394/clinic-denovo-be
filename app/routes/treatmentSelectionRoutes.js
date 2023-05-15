"use strict";

const treatmentSelection = require("../controllers/treatmentSelectionController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/treatment-selection')
        .post(catchError(treatmentSelection.createTreatmentSelection))
        .put(catchError(treatmentSelection.updateTreatmentSelection))

    app.route('/api/treatment-selection/:id')
        .get(catchError(treatmentSelection.getTreatmentSelection))
        .delete(catchError(treatmentSelection.deleteTreatmentSelection))
        .post(catchError(treatmentSelection.activateTreatmentSelection))

    app.route('/api/treatment-selections').get(catchError(treatmentSelection.listAllTreatmentSelections))

    app.route('/api/treatment-selections/transaction').post(catchError(treatmentSelection.createTreatmentTransaction))
    app.route('/api/treatment-selections/treatment/:id').get(catchError(treatmentSelection.getTreatementSelectionByTreatmentID))
    app.route('/api/treatment-selections/payment').put(catchError(treatmentSelection.treatmentPayment))
    app.route('/api/treatment-selections/filter').post(catchError(treatmentSelection.getRelatedTreatmentSelections))
    app.route('/api/treatment-selections/search').post(catchError(treatmentSelection.searchTreatmentSelections))
    app.route('/api/treatment-selections/code').get(catchError(treatmentSelection.createTreatmentSelectionCode))
};
