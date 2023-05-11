'use strict';

const auth = require('../controllers/authController');
const verifyToken = require('../lib/verifyToken');
const { catchError } = require('../lib/errorHandler');


module.exports = app => {

       app.route('/api/auth/login').post(auth.login);

       app.route('/api/auth/logout').get(catchError(auth.logout));
};
