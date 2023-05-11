"use strict";

const doctor = require("../controllers/doctorController");
const { catchError } = require("../lib/errorHandler");
const  verifyToken= require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/doctor')
        .post(catchError(doctor.createDoctor))
        .put( catchError(doctor.updateDoctor))
        
    app.route('/api/doctor/:id')
        .get(catchError(doctor.getDoctor))
        .delete( catchError(doctor.deleteDoctor)) 
        .post( catchError(doctor.activateDoctor))

    app.route('/api/doctors').get(catchError(doctor.listAllDoctors))

};
