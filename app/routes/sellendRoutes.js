"use strict";

const sellend = require("../controllers/sellendController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/sellend')
        .post(catchError(sellend.createSellEnd))
        .put(catchError(sellend.updateSellEnd))
        
    app.route('/api/sellend/:id')
        .get(catchError(sellend.getSellEnd))
        .delete(catchError(sellend.deleteSellEnd)) 
        .post(catchError(sellend.activateSellEnd))

    app.route('/api/sellends').get(catchError(sellend.listAllSellEnds))
};
