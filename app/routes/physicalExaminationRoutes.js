"use strict";

const physicalExamination = require("../controllers/physicalExaminationController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/physical-examination')
        .post(catchError(physicalExamination.createPhysicalExamination))
        .put(catchError(physicalExamination.updatePhysicalExamination))

    app.route('/api/physical-examination/:id')
        .get(catchError(physicalExamination.getPhysicalExamination))
        .delete(catchError(physicalExamination.deletePhysicalExamination))
        .post(catchError(physicalExamination.activatePhysicalExamination))

    app.route('/api/physical-examinations').get(catchError(physicalExamination.listAllPhysicalExaminations))

    app.route('/api/physical-examinations-filter')
        .get(catchError(physicalExamination.filterPhysicalExaminations))

    app.route('/api/physical-examinations-search')
        .post(catchError(physicalExamination.searchPhysicalExaminations))
};
