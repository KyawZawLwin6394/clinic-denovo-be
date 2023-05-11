'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let TreatmentVoucherSchema = new Schema({
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    relatedTreatment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Treatments'
    },
    relatedAppointment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Appointments'
    },
    relatedPatient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Patients'
    },
    paymentMethod:{
        type:String,
        enum:['by Appointment','Lumpsum','Total','Advanced']
    },
    amount:{
        type:Number
    },
    code:{
        type:String
    },
    relatedBank:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'AccountingLists'
    },
    relatedCash:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'AccountingLists'
    },
    paymentType:{
        type:String,
        enum:['Bank','Cash']
    },
    seq:{
        type:Number
    },
    relatedTreatmentSelection: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'TreatmentSelections'
    },
    remark:{
        type:String 
    }
});

module.exports = mongoose.model('TreatmentVouchers', TreatmentVoucherSchema);

//Author: Kyaw Zaw Lwin
