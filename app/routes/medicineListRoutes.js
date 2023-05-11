"use strict";

const medicineList = require("../controllers/medicineListController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/medicine-list')
        .post( catchError(medicineList.createMedicineList))
        .put(catchError(medicineList.updateMedicineList))
        
    app.route('/api/medicine-list/:id')
        .get(catchError(medicineList.getMedicineList))
        .delete(catchError(medicineList.deleteMedicineList)) 
        .post(catchError(medicineList.activateMedicineList))

    app.route('/api/medicine-lists').get(catchError(medicineList.listAllMedicineLists))

    app.route('/api/medicine-lists-search').post(catchError(medicineList.searchMedicineLists))

};
