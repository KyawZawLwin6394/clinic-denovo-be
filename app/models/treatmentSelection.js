'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let TreatmentSelectionSchema = new Schema({
  code : {
    type:String
  },
  paymentMethod: {
    type: String,
    enum: ['Credit','Cash Down','Bank']
  },
  paidAmount: {
    type: Number,
  },
  leftOverAmount: {
    type: Number,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  },
  relatedTreatment: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Treatments'
  },
  relatedTreatmentUnit:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'TreatmentUnits'
  },
  relatedAppointments: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Appointments',
    required: true
  },
  selectionStatus: {
    type: String,
    enum: ['Ongoing', 'Done']
  },
  relatedPatient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Patients'
  },
  finishedAppointments: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Appointments',
  },
  remainingAppointments: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Appointments',
  },
  relatedTransaction: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Transactions'
  },
  inBetweenDuration: {
    type: Number
  },
  bodyParts: {
    type: String,
    enum: ['Face', 'Body', 'Body Injection'],
    required: true,
  },
  treatmentTimes: {
    type:Number
  },
  seq:{
    type:Number
  }

});
const patient = mongoose.model('TreatmentSelections', TreatmentSelectionSchema)
module.exports = patient;

//Author: Kyaw Zaw Lwin
