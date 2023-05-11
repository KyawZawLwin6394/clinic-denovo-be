"use strict";

const expense = require("../controllers/expenseController");
const { catchError } = require("../lib/errorHandler");
const  verifyToken= require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/expense')
        .post(catchError(expense.createExpense))
        .put(catchError(expense.updateExpense))
        
    app.route('/api/expense/:id')
        .get( catchError(expense.getExpense))
        .delete(catchError(expense.deleteExpense)) 
        .post( catchError(expense.activateExpense))

    app.route('/api/expenses').get( catchError(expense.listAllExpenses))
};
