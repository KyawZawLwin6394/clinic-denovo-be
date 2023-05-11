"use strict";

const subHeader = require("../controllers/subHeaderController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/sub-header')
        .post(catchError(subHeader.createSubHeader))
        .put(catchError(subHeader.updateSubHeader))
        
    app.route('/api/sub-header/:id')
        .get( catchError(subHeader.getSubHeader))
        .delete(catchError(subHeader.deleteSubHeader)) 
        .post( catchError(subHeader.activateSubHeader))

    app.route('/api/sub-headers').get(catchError(subHeader.listAllSubHeaders))
};
