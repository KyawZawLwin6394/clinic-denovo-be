'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let ExpenseSchema = new Schema({
    relatedAccounting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists',
        required: true
    },
    date: {
        type: Date,
        required: true,
    },
    remark: {
        type: String,
        required: true
    },
    initialAmount: {
        type: Number,
        required: true,
    },
    initialCurrency: {
        type:String,
        required: true,
    },
    finalAmount: {
        type: Number,
        required: true,
    },
    finalCurrency: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    relatedCredit: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'AccountingLists'
    },
    relatedBankAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists'
    },
    relatedCashAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists'
    },
});

module.exports = mongoose.model('Expenses', ExpenseSchema);

//Author: Kyaw Zaw Lwin
