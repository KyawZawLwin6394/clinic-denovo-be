"use strict";

const treatmentHistory = require("../controllers/treatmentHistoryController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');
const upload = require('../lib/fieldUploader').upload;

module.exports = (app) => {

    app.route('/api/treatment-history')
        .post(upload,catchError(treatmentHistory.createTreatmentHistory))
        .put(upload ,catchError(treatmentHistory.updateTreatmentHistory))
        
    app.route('/api/treatment-history/:id')
        .get( catchError(treatmentHistory.getTreatmentHistory))
        .delete(catchError(treatmentHistory.deleteTreatmentHistory)) 
        .post( catchError(treatmentHistory.activateTreatmentHistory))

    app.route('/api/treatment-histories').get(catchError(treatmentHistory.listAllTreatmentHistorys))
};
