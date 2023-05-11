'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let AppointmentSchema = new Schema({
  relatedPatient: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Patients'
  },
  phone: {
    type:String
  },
  relatedDoctor: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Doctors',
    required: function() {
      return !this.relatedTherapist; // therapist is required if field2 is not provided
    }
  },
  relatedTherapist: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Doctors',
    required: function() {
      return !this.relatedDoctor; // doctor is required if field2 is not provided
    }
  },
  description: {
    type:String
  },
  originalDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date
  },
  date:{
    type: String,
  },
  time:{
    type:String,
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  },
  token: {
    type:String
  },
  relatedTreatmentSelection: {
    type:[mongoose.Schema.Types.ObjectId],
    ref:'TreatmentSelections'
  },
  status: {
    type:String
  }
});

module.exports = mongoose.model('Appointments', AppointmentSchema);

//Author: Kyaw Zaw Lwin
