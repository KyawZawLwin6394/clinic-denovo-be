"use strict";

const accessoryItem = require("../controllers/accessoryItemController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/accessory-item')
        .post(catchError(accessoryItem.createAccessoryItem))
        .put(catchError(accessoryItem.updateAccessoryItem))
        
    app.route('/api/accessory-item/:id')
        .get(catchError(accessoryItem.getAccessoryItem))
        .delete(catchError(accessoryItem.deleteAccessoryItem)) 
        .post(catchError(accessoryItem.activateAccessoryItem))

    app.route('/api/accessory-items').get(catchError(accessoryItem.listAllAccessoryItems))
    app.route('/api/accessory-items/:id').get(catchError(accessoryItem.getRelatedAccessoryItem))
    app.route('/api/accessory-items-search').post(catchError(accessoryItem.searchAccessoryItems))
    };
