"use strict";

const { verify } = require("crypto");
const brand = require("../controllers/brandController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/brand')
        .post(catchError(brand.createBrand))
        .put(catchError(brand.updateBrand))

    app.route('/api/brand/:id')
        .get(catchError(brand.getBrand))
        .delete(catchError(brand.deleteBrand))
        .post(catchError(brand.activateBrand))

    app.route('/api/brands').get(catchError(brand.listAllBrands))

    app.route('/api/brands-filter')
        .get(catchError(brand.filterBrands))

    app.route('/api/brands-search')
        .post(catchError(brand.searchBrands))
};
