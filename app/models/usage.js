'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let UsageSchema = new Schema({
    relatedTreatmentSelection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TreatmentSelections',
        required: true
    },
    relatedAppointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TreatmentSelections',
        required: true
    },
    procedureMedicine: [{
        item_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'ProcedureItems'
        },
        stock:Number,
        actual:Number,
        remark:String
      }],
      procedureAccessory: [{
        item_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'AccessoryItems'
        },
        stock:Number,
        actual:Number,
        remark:String
      }],
      machine:[{
        item_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'FixedAssets'
        },
        stock:Number,
        actual:Number,
        remark:String
      }],
      isDeleted: {
        type:Boolean, 
        required:true,
        default:false
      },
});

module.exports = mongoose.model('Usages', UsageSchema);

//Author: Kyaw Zaw Lwin
