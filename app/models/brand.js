'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let BrandSchema = new Schema({
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Categories',
    required:true,
  },
  subCategory: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'SubCategories',
    required:true,
  },
  description: {
    type:String,
    required:true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  }
});

module.exports = mongoose.model('Brands', BrandSchema);

//Author: Kyaw Zaw Lwin
