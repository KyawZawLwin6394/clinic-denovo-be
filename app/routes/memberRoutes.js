"use strict";

const member = require("../controllers/memberController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/member')
        .post( catchError(member.createMember))
        .put( catchError(member.updateMember))

    app.route('/api/member/:id')
        .get( catchError(member.getMember))
        .delete( catchError(member.deleteMember))
        .post( catchError(member.activateMember))

    app.route('/api/members').get( catchError(member.listAllMembers))

};
