'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let ProcedureHistorySchema = new Schema({
    skinCareAndCosmetic: [{
        item: String,
        remark: String
    }],
    drugHistory: {
        type: String
    },
    medicalHistory: {
        type: String
    },
    allergyHistory: {
        type: String
    },
    treatmentHistory: {
        type: String
    },
    complaint: {
        type: String,
    },
    skinType: [{
        item: String,
        remark: String
    }],
    acne: [{
        item: String,
        remark: String
    }],
    melasmaAndBlackSpot: [{
        item: String,
        remark: String
    }],
    mesoFat: [{
        item: String,
        remark: String
    }],
    facialDesign: [{
        item: String,
        remark: String
    }],
    otherPhysicalExamination: {
        type: String
    },
    consultationCharges: {
        type: String
    },
    serviceCharges: {
        type: String
    },
    nextAppointment: {
        type: Date
    },
    diagnosis: {
        type: String
    },
    remark: {
        type: String
    },
    medicineItems: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MedicineItems'
        },
        qty: Number,
        duration: Number,
        dose: String,
        totalQTY: Number,
        subTotal: Number,
        SIG: String,
        subSIG: String
    }],
    treatmentPackages: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TreatmentUnits'
        },
        qty: Number,
        price: Number,
        totalPrice: Number,
        SIG: String
    }],
    customTreatmentPackages: {
        item_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'TreatmentUnits'
        }
    },
    attachments:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Attachments'
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    relatedPatient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Patients'
    },
    date: {
        type:Date,
        default:Date.now()
    },
    pHistory: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Attachments'
    },
    relatedAppointment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Appointments'
    },
    relatedTreatment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Treatments'
    }
});

module.exports = mongoose.model('ProcedureHistories', ProcedureHistorySchema);

//Author: Kyaw Zaw Lwin
