"use strict";

const systemSetting = require("../controllers/systemSettingController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/system-setting')
        .post(catchError(systemSetting.createSystemSetting))
        .put(catchError(systemSetting.updateSystemSetting))

    app.route('/api/system-setting/:id')
        .get(catchError(systemSetting.getSystemSetting))
        .delete(catchError(systemSetting.deleteSystemSetting))
        .post(catchError(systemSetting.activateSystemSetting))

    app.route('/api/system-settings').get(catchError(systemSetting.listAllSystemSettings))
};
