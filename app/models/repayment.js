'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let RepaymentSchema = new Schema({
  repaymentDate: {
    type: Date,
    required: true
  },
  repaymentAmount: {
    type: Number,
    required: true,
  },
  remaningCredit: {
    type:Number,
    required:true
  },
  description: {
    type: String,
    required:true,
  },
  relatedPateintTreatment: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'PatientTreatments',
    required:true,
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  }
});

module.exports = mongoose.model('Repayments', RepaymentSchema);

//Author: Kyaw Zaw Lwin
