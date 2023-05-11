"use strict";

const subCategory = require("../controllers/subCategoryController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/sub-category')
        .post(catchError(subCategory.createSubCategory))
        .put(catchError(subCategory.updateSubCategory))
        
    app.route('/api/sub-category/:id')
        .get(catchError(subCategory.getSubCategory))
        .delete(catchError(subCategory.deleteSubCategory)) 
        .post(catchError(subCategory.activateSubCategory))

    app.route('/api/sub-categories').get(catchError(subCategory.listAllSubCategories))

};
