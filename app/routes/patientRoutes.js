"use strict";

const patient = require("../controllers/patientController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");
const upload = require('../lib/fieldUploader').upload;

module.exports = (app) => {

    app.route('/api/patient')
        .post(upload,catchError(patient.createPatient))
        .put(upload, catchError(patient.updatePatient))
    
    app.route('/api/patient/:id')
        .get(catchError(patient.getPatient))
        .delete(catchError(patient.deletePatient)) 
        .post(catchError(patient.activatePatient))

    app.route('/api/patients').get(catchError(patient.listAllPatients))

    app.route('/api/patients-filter')
        .get(catchError(patient.filterPatients))

    app.route('/api/patients-search')
        .post(catchError(patient.searchPatients))
};
