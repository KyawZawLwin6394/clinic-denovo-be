"use strict";

const medicineItem = require("../controllers/medicineItemController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/medicine-item')
        .post(catchError(medicineItem.createMedicineItem))
        .put(catchError(medicineItem.updateMedicineItem))
        
    app.route('/api/medicine-item/:id')
        .get(catchError(medicineItem.getMedicineItem))
        .delete(catchError(medicineItem.deleteMedicineItem)) 
        .post(catchError(medicineItem.activateMedicineItem))

    app.route('/api/medicine-items').get(catchError(medicineItem.listAllMedicineItems))

    app.route('/api/medicine-items/:id').get(catchError(medicineItem.getRelatedMedicineItem))

    app.route('/api/medicine-items-search').post(catchError(medicineItem.searchMedicineItems))

};
