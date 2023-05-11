'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let procedureItemSchema = new Schema({
  code: {
    type: String
  },
  procedureItemName:{
    type:String,
  },
  name: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'ProcedureMedicines'
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
  perUnitQuantity:{
    type:Number
  },
  relatedCategory: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Categories'
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

module.exports = mongoose.model('ProcedureItems', procedureItemSchema);

//Author: Kyaw Zaw Lwin
