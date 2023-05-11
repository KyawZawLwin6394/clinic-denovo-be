'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let BankSchema = new Schema({
  bankName: {
    type: String,
    required: true
  },
  accountNumber: {
    type: Number,
    required: true,
  },
  accountHolderName: {
    type:String,
    required:true
  },
  bankContact: {
    type: String,
    required:true,
  },
  openingDate: {
    type: Date,
    required:true,
  },
  balance: {
    type: Number,
  },
  bankAddress: {
    type: String,
    required:true,
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  },
  relatedCurrency: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Currencies'
  },
  relatedAccounting:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'AccountingLists'
  },
  accountName: {
    type:String,
    required:true
  },
  bank:{
    type:String
  }
});

module.exports = mongoose.model('Banks', BankSchema);

//Author: Kyaw Zaw Lwin
