'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let PurchaseSchema = new Schema({
    purchaseDate: {
        type: Date,
        required: true
    },
    supplierName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Suppliers',
        required: true,
    },
    remark: {
        type: String,
        required: true
    },
    medicineItems: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MedicineItems'
        },
        qty: Number,
        price: Number,
        subTotal: Number
    }],
    procedureItems: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProcedureItems'
        },
        qty: Number,
        price:Number,
        subTotal:Number
    }],
    accessoryItems: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AccessoryItems'
        },
        qty: Number,
        price:Number,
        subTotal:Number
    }],
    totalQTY: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required:true
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    date:{
        type:Date,
        default:Date.now()
    },
    purchaseType:{
        type:String,
        enum:['Cash Down','Credit']
    },
    creditAmount:{
        type:Number
    }
});

module.exports = mongoose.model('Purchases', PurchaseSchema);

//Author: Kyaw Zaw Lwin
