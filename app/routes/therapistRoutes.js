"use strict";

const therapist = require("../controllers/therapistController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/therapist')
        .post(catchError(therapist.createTherapist))
        .put(catchError(therapist.updateTherapist))
        
    app.route('/api/therapist/:id')
        .get(catchError(therapist.getTherapist))
        .delete(catchError(therapist.deleteTherapist)) 
        .post(catchError(therapist.activateTherapist))

    app.route('/api/therapists').get(catchError(therapist.listAllTherapists))

};
