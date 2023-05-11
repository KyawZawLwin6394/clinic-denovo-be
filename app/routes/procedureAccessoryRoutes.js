"use strict";

const procedureAccessory = require("../controllers/procedureAccessoryController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/procedure-accessory')
        .post(catchError(procedureAccessory.createProcedureAccessory))
        .put(catchError(procedureAccessory.updateProcedureAccessory))
        
    app.route('/api/procedure-accessory/:id')
        .get(catchError(procedureAccessory.getProcedureAccessory))
        .delete(catchError(procedureAccessory.deleteProcedureAccessory)) 
        .post(catchError(procedureAccessory.activateProcedureAccessory))

    app.route('/api/procedure-accessories').get(catchError(procedureAccessory.listAllProcedureAccessorys))

    app.route('/api/procedure-accessories-search').post(catchError(procedureAccessory.searchProcedureAccessories))
};
