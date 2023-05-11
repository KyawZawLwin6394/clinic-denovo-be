'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let DeferSchema = new Schema({
  relatedPatientTreatment: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'PatientTreatments',
    required:true
  },
  leftOverAmount: {
    type:Number,
    required:true
  },
  deferredAmount: {
    type:Number,
    required:true
  },
  deferredDate: {
    type:Date,
    required:true
  },
  remark: {
    type:String
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  }
});

module.exports = mongoose.model('Defers', DeferSchema);

//Author: Kyaw Zaw Lwin
