'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let TreatmentUnitSchema = new Schema({
  code: {
    type: String,
    required: true
  },
  name: {
    type:String,
    required:true,
  },
  procedureMedicine: {
    type:[mongoose.Schema.Types.ObjectId],
    ref:'ProcedureMedicines' //array of objectIDss
  },
  machine: {
    type:[mongoose.Schema.Types.ObjectId], //array of objectIDs
  },
  estimateCost: {
    type:Number
  },
  sellingPrice: {
    type:Number,
    required:true,
  },
  description: {
    type:String,
  },
  updatedAt: {
    type: Date
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  },
  patientTreatmentID: {
    type:String,
  },
  seq: {
    type:Number,
    required:true,  
  }
});

module.exports = mongoose.model('TreatmentUnits', TreatmentUnitSchema);

//Author: Kyaw Zaw Lwin
