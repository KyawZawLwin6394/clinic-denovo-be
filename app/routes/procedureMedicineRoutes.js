"use strict";

const procedureMedicine = require("../controllers/procedureMedicineController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/procedure-medicine')
        .post(catchError(procedureMedicine.createMedicineProcedure))
        .put(catchError(procedureMedicine.updateMedicineProcedure))
        
    app.route('/api/procedure-medicine/:id')
        .get(catchError(procedureMedicine.getMedicineProcedure))
        .delete(catchError(procedureMedicine.deleteMedicineProcedure)) 
        .post(catchError(procedureMedicine.activateMedicineProcedure))

    app.route('/api/procedure-medicines').get(catchError(procedureMedicine.listAllMedicineProcedure))

    app.route('/api/procedure-medicines-search').post(catchError(procedureMedicine.searchProcedureMedicine))

};
