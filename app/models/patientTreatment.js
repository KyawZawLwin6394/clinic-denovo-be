'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let PatientTreatmentSchema = new Schema({
  relatedPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Patients',
    required: true
  },
  relatedTreatment: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Treatments',
    required: true,
  },
  leftOverAmount: {
    type:Number,
    required:true
  },
  paidAmount: {
    type: Number,
    required:true,
  },
  relatedTreatmentSelection: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'TreatmentSelections',
    required:true
  },
  fullyPaid: {
    type: Boolean,
    required:true
  },
  finishedAppointments: {
    type:[mongoose.Schema.Types.ObjectId],
    ref:'Appointments',
  },
  remainingAppointments: {
    type:[mongoose.Schema.Types.ObjectId],
    ref:'Appointments',
  },
  isDeleted: {
    type:Boolean,
    default:false
  },
  status:{
    type:String
  },
  date:{
    type:Date,
    default:Date.now()
  }
});

module.exports = mongoose.model('PatientTreatments', PatientTreatmentSchema);

//Author: Kyaw Zaw Lwin
