"use strict";

const fixedAsset = require("../controllers/fixedAssetController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/fixed-asset')
        .post(catchError(fixedAsset.createFixedAsset))
        .put(catchError(fixedAsset.updateFixedAsset))
        
    app.route('/api/fixed-asset/:id')
        .get(catchError(fixedAsset.getFixedAsset))
        .delete(catchError(fixedAsset.deleteFixedAsset)) 
        .post(catchError(fixedAsset.activateFixedAsset))

    app.route('/api/fixed-assets').get(catchError(fixedAsset.listAllFixedAssets))
};
