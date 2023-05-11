'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let AccessoryItem = new Schema({
  code: {
    type: String
  },
  accessoryItemName:{
    type:String,
  },
  name: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'ProcedureAccessories'
  },
  currentQuantity: {
    type:Number
  },
  reOrderQuantity: {
    type:Number,
  },
  purchasePrice: {
    type:Number
  },
  sellingPrice: {
    type:Number
  },
  description: {
    type:String,
  },
  fromUnit: {
    type:Number,
  },
  toUnit: {
    type:Number
  },
  totalUnit: {
    type:Number
  },
  updatedAt: {
    type: Date
  },
  isDeleted: {
    type:Boolean,
    default:false
  },
  totalUnit:{
    type:Number
  },
  relatedCategory: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Categories'
  },
  perUnitQuantity:{
    type:Number
  },
  relatedBrand: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Brands'
  },
  relatedSubCategory: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'SubCategories'
  }
});

module.exports = mongoose.model('AccessoryItems', AccessoryItem);

//Author: Kyaw Zaw Lwin
