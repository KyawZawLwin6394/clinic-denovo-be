"use strict";

const profitAndLoss = require("../controllers/porfitAndLossController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {
    app.route('/api/profit-and-loss').get(catchError(profitAndLoss.listAllLog))
    app.route('/api/profit-and-losses/week').post(catchError(profitAndLoss.getWeek))
    app.route('/api/profit-and-losses/month').post(catchError(profitAndLoss.getMonth))
    app.route('/api/profit-and-losses/day').post(catchError(profitAndLoss.getDay))
    app.route('/api/profit-and-losses/total').get(catchError(profitAndLoss.getTotal))
    app.route('/api/profit-and-losses/total/branch').get(catchError(profitAndLoss.getTotalwithBranch))
    app.route('/api/profit-and-losses/total-filter').get(catchError(profitAndLoss.getTotalWithDateFilter))

    // app.route('/api/profit-and-losses/month').post(catchError(profitAndLoss.createUsage))
};
