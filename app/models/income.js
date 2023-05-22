'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let IncomeSchema = new Schema({
    relatedAccounting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists',
        required: true
    },
    date: {
        type: Date,
    },
    remark: {
        type: String,
    },
    initialAmount: {
        type: Number,
    },
    initialCurrency: {
        type: String,
    },
    finalAmount: {
        type: Number,
    },
    finalCurrency: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    relatedBankAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists'
    },
    relatedCashAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists'
    },
    relatedCredit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists'
    }
});

module.exports = mongoose.model('Incomes', IncomeSchema);

//Author: Kyaw Zaw Lwin
