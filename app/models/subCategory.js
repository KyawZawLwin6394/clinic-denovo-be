'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let SubCategorySchema = new Schema({
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type:String,
    required:true
  },
  relatedCategory: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Categories',
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

module.exports = mongoose.model('SubCategories', SubCategorySchema);

//Author: Kyaw Zaw Lwin
