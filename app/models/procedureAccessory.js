'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let ProcedureAccessory = new Schema({
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
  },
  relatedBrand: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Brands',
    required:true,
  },
  description: {
    type:String,
    required:true,
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

module.exports = mongoose.model('ProcedureAccessories', ProcedureAccessory);

//Author: Kyaw Zaw Lwin
