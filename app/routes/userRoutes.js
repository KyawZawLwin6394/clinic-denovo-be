'use strict';

const user = require('../controllers/userController');
const { catchError } = require('../lib/errorHandler');
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {
  app
    .route('/api/user')
    .post(  catchError(user.createUser))
    .put( catchError(user.updateUser));

  app
    .route('/api/user/:id')
    .get( catchError(user.getUserDetail))
    .delete( catchError(user.deleteUser))
    .post( catchError(user.activateUser));

  app.route('/api/users').get( catchError(user.listAllUsers));

  app.route('/api/users/doctor').post(  catchError(user.createDoctor))
  //app.route('/api/users/admin').post(  ,catchError(user.createAdmin))
  app.route('/api/me').get(
    
    (req, res, next) => {
      req.params.id = req.credentials.userId;
      next();
    },
    catchError(user.getUserDetail),
  );
};
