"use strict";

const treatmentUnit = require("../controllers/treatmentUnitController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/treatment-unit')
        .post(catchError(treatmentUnit.createTreatmentUnit))
        .put(catchError(treatmentUnit.updateTreatmentUnit))
        
    app.route('/api/treatment-unit/:id')
        .get(catchError(treatmentUnit.getTreatmentUnit))
        .delete(catchError(treatmentUnit.deleteTreatmentUnit)) 
        .post(catchError(treatmentUnit.activateTreatmentUnit))

    app.route('/api/treatment-units').get(catchError(treatmentUnit.listAllTreatmentUnits))

};
