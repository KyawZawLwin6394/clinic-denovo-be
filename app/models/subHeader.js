'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let SubHeaderSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    description: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    updatedAt: {
        type: Date,
    },
});

module.exports = mongoose.model('SubHeaders', SubHeaderSchema);

//Author: Kyaw Zaw Lwin
