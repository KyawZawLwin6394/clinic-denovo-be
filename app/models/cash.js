'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let CashSchema = new Schema({
  relatedAccounting: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'AccountingLists',
    required: true
  },
  relatedCurrency: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Currencies',
    required: true
  },
  name: {
    type: String,
    required: true,
  },
  amount: {
    type:Number,
    required:true
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  },
});

module.exports = mongoose.model('Cashes', CashSchema);

//Author: Kyaw Zaw Lwin
