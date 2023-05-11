"use strict";

const appointment = require("../controllers/appointmentController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/appointment')
        .post(catchError(appointment.createAppointment))
        .put(catchError(appointment.updateAppointment))
        
    app.route('/api/appointment/:id')
        .get(catchError(appointment.getAppointment))
        .delete(catchError(appointment.deleteAppointment)) 
        .post(catchError(appointment.activateAppointment))

    app.route('/api/appointments-filter')
        .get(catchError(appointment.filterAppointments))

    app.route('/api/appointments').get(catchError(appointment.listAllAppointments))
    app.route('/api/appointment-search')
        .post(catchError(appointment.searchAppointment))

    app.route('/api/appointments/today')
        .get(catchError(appointment.getTodaysAppointment))
};
