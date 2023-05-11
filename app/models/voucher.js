'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let VoucherSchema = new Schema({
  voucherType: {
    type:String,
    required:true,
  },
  voucherCode: {
    type:String,
    required:true
  },
  date: {
    type:Date,
    required:true
  },
  relatedPatient: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Patients',
  },
  medicineSaleItems:[{
    item_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'MedicineItems'
    },
    quantity:Number,
    discount:Number
  }],
  totalAmount: {
    type: Number,
  },
  discount: {
    type: Number,
  },
  grandTotal: {
    type: Number,
  },
  paymentMethod:{
    type: String,
    enum:['Bank','Cash Down']
  },
  relatedAccounting:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Accounting'
  },
  remark:{
    type:String
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  },
  relatedTreatment:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Treatments',
    required:true
  }
});

module.exports = mongoose.model('Vouchers', VoucherSchema);

//Author: Kyaw Zaw Lwin
