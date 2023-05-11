'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let TherapistSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  speciality: {
    type: String,
    required: true,
  },
  treatmentUnitMain: {
    type:String,
    required:true
  },
  schedule: {
    type: Array,
    required:true,
  },
  commission: {
    type: Number,
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

module.exports = mongoose.model('Therapists', TherapistSchema);

//Author: Kyaw Zaw Lwin
