'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let LogSchema = new Schema({
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
    date: {
        type: Date,
        default:Date.now()
    },
    currentQty: {
        type: Number,
    },
    actualQty: {
        type: Number,
    },
    finalQty: {
        type: Number,
    },
    relatedProcedureItems:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'ProcedureItems'
    },
    relatedAccessoryItems:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'AccessoryItems'
    },
    relatedMachine:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'FixedAssets'
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = mongoose.model('Logs', LogSchema);

//Author: Kyaw Zaw Lwin
