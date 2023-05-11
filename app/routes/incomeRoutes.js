"use strict";

const income = require("../controllers/incomeController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/income')
        .post(catchError(income.createIncome))
        .put(catchError(income.updateIncome))
        
    app.route('/api/income/:id')
        .get(catchError(income.getIncome))
        .delete(catchError(income.deleteIncome)) 
        .post( catchError(income.activateIncome))

    app.route('/api/incomes').get( catchError(income.listAllIncomes))
};
