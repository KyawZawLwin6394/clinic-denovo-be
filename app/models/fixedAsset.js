'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let FixedAssetSchema = new Schema({
  name: {
    type: String
  },
  description: {
    type: String
  },
  relatedAccount: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'AccountingLists',
    required:true
  },
  type: {
    type: String
  },
  existingAsset: {
    type: Boolean
  },
  initialPrice: {
    type: Number,
  },
  usedYear: {
    type: String
  },
  salvageValue: {
    type:Number
  },
  depriciationTotal: {
    type:Number
  },
  useLife:{
    type:Number
  },
  currentPrice: {
    type:Number
  },
  yearDepriciation:{
    type:Number
  },
  startDate:{
    type:Date
  },
  isDeleted:{
    type:Boolean,
    default:false
  }
});

module.exports = mongoose.model('FixedAssets', FixedAssetSchema);

//Author: Kyaw Zaw Lwin
