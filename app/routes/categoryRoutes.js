"use strict";

const category = require("../controllers/categoryController");
const { catchError } = require("../lib/errorHandler");
const  verifyToken= require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/category')
        .post(catchError(category.createCategory))
        .put( catchError(category.updateCategory))
        
    app.route('/api/category/:id')
        .get(catchError(category.getCategory))
        .delete(catchError(category.deleteCategory)) 
        .post(catchError(category.activateCategory))

    app.route('/api/categories').get(catchError(category.listAllCategories))

};
