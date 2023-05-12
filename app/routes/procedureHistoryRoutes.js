"use strict";

const procedureHistory = require("../controllers/procedureHistoryController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');
const upload = require('../lib/fieldUploader').upload;

module.exports = (app) => {

    app.route('/api/procedure-history')
        .post(upload, catchError(procedureHistory.createProcedureHistory))
        .put(catchError(procedureHistory.updateProcedureHistory))

    app.route('/api/procedure-history/:id')
        .get(catchError(procedureHistory.getProcedureHistory))
        .delete(catchError(procedureHistory.deleteProcedureHistory))
        .post(catchError(procedureHistory.activateProcedureHistory))

    app.route('/api/procedure-history-upload')
        .post(upload, catchError(procedureHistory.uploadImage))

    app.route('/api/procedure-histories').get(catchError(procedureHistory.listAllProcedureHistorys))

    app.route('/api/procedure-histories/:id').get(catchError(procedureHistory.getRelatedProcedureHistory))
};
