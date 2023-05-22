'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let TreatmentListSchema = new Schema({
  code: {
    type: String,
  },
  name: {
    type: String,
  },
  bodyParts: {
    type:String,
    enum:['Face','Body','Body Injection'],
  },
  description: {
    type:String,
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

module.exports = mongoose.model('TreatmentLists', TreatmentListSchema);

//Author: Kyaw Zaw Lwin
