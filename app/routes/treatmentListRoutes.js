"use strict";

const treatmentList = require("../controllers/treatmentListController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/treatment-list')
        .post(catchError(treatmentList.createTreatmentList))
        .put(catchError(treatmentList.updateTreatmentList))
        
    app.route('/api/treatment-list/:id')
        .get(catchError(treatmentList.getTreatmentList))
        .delete(catchError(treatmentList.deleteTreatmentList)) 
        .post(catchError(treatmentList.activateTreatmentList))

    app.route('/api/treatment-lists').get(catchError(treatmentList.listAllTreatmentLists))

    app.route('/api/treatment-lists-filter')
        .get(catchError(treatmentList.filterTreatmentLists))

    app.route('/api/treatment-lists-search')
        .post(catchError(treatmentList.searchTreatmentLists))
};
