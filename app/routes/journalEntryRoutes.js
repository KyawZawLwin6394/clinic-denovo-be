"use strict";

const journal = require("../controllers/journalEntryController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/journal')
        .post(verifyToken, catchError(journal.createJournal))
        
    app.route('/api/journal/:id')
        .get(verifyToken, catchError(journal.getJournal))

    app.route('/api/journals').get(verifyToken, catchError(journal.getAllJournals))
};
