"use strict";

const patientTreatment = require("../controllers/patientTreatmentController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/patient-treatment')
        .post(catchError(patientTreatment.createPatientTreatment))
        .put(catchError(patientTreatment.updatePatientTreatment))
        
    app.route('/api/patient-treatment/:id')
        .get( catchError(patientTreatment.getPatientTreatment))
        .delete(catchError(patientTreatment.deletePatientTreatment)) 
        .post( catchError(patientTreatment.activatePatientTreatment))

    app.route('/api/patient-treatments').get(catchError(patientTreatment.listAllPatientTreatments))

    app.route('/api/patient-treatments/outstanding').get(catchError(patientTreatment.getOutstandingPatientTreatment))
    app.route('/api/patient-treatments/well-done').get(catchError(patientTreatment.getWellDonePatientTreatment))
};
