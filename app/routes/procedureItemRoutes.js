"use strict";

const procedureItem = require("../controllers/procedureItemController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/procedure-item')
        .post(catchError(procedureItem.createProcedureItem))
        .put(catchError(procedureItem.updateProcedureItem))
        
    app.route('/api/procedure-item/:id')
        .get(catchError(procedureItem.getProcedureItem))
        .delete(catchError(procedureItem.deleteProcedureItem)) 
        .post(catchError(procedureItem.activateProcedureItem))

    app.route('/api/procedure-items').get(catchError(procedureItem.listAllProcedureItems))
    app.route('/api/procedure-items/:id').get(catchError(procedureItem.getRelatedProcedureItem))
    app.route('/api/procedure-items-search').post(catchError(procedureItem.searchProcedureItems))

};
