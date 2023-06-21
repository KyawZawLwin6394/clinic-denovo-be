'use strict';
const SaleReturn = require('../models/saleReturn');
const TreatmentSelection = require('../models/treatmentSelection');
const TreatmentVoucher = require('../models/treatmentVoucher');

exports.listAllSaleReturns = async (req, res) => {
    let { keyword, role, limit, skip } = req.query;
    let count = 0;
    let page = 0;
    try {
        limit = +limit <= 100 ? +limit : 10; //limit
        skip = +skip || 0;
        let query = req.mongoQuery,
            regexKeyword;
        role ? (query['role'] = role.toUpperCase()) : '';
        keyword && /\w/.test(keyword)
            ? (regexKeyword = new RegExp(keyword, 'i'))
            : '';
        regexKeyword ? (query['name'] = regexKeyword) : '';
        let result = await SaleReturn.find(query).populate('relatedBranch relatedTreatmentSelection relatedTreatmentVoucher relatedAppointment relatedSubTreatment')
        count = await SaleReturn.find(query).count();
        const division = count / limit;
        page = Math.ceil(division);

        res.status(200).send({
            success: true,
            count: count,
            _metadata: {
                current_page: skip / limit + 1,
                per_page: limit,
                page_count: page,
                total_count: count,
            },
            list: result,
        });
    } catch (e) {
        return res.status(500).send({ error: true, message: e.message });
    }
};

exports.getSaleReturn = async (req, res) => {
    let query = req.mongoQuery
    if (req.params.id) query._id = req.params.id
    const result = await SaleReturn.find(query).populate('relatedBranch relatedPatient relatedTreatmentSelection relatedTreatmentVoucher relatedAppointment relatedSubTreatment')
    if (result.length === 0)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createSaleReturn = async (req, res, next) => {
    let newBody = req.body;
    let { relatedTreatmentSelection, relatedSubTreatment, returnType } = req.body;
    try {
        if (returnType === 'Full Cash' && relatedTreatmentSelection) {
            var selecUpdate = await TreatmentSelection.findOneAndUpdate(
                { _id: relatedTreatmentSelection },
                { saleReturnFlag: true },
                { new: true }
            )
        }
        const newSaleReturn = new SaleReturn(newBody);
        const result = await newSaleReturn.save();
        if (relatedTreatmentSelection && relatedSubTreatment) {
            var selecUpdate = await TreatmentSelection.findOneAndUpdate(
                { _id: relatedTreatmentSelection },
                { saleReturnFlag: true },
                { new: true }
            );
        }
        res.status(200).send({
            message: 'SaleReturn create success',
            success: true,
            data: result,
            selecUpdate: selecUpdate
        });
    } catch (error) {
        // console.log(error )
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateSaleReturn = async (req, res, next) => {
    try {
        const result = await SaleReturn.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('relatedBranch relatedPatient relatedTreatmentSelection relatedTreatmentVoucher relatedAppointment relatedSubTreatment')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteSaleReturn = async (req, res, next) => {
    try {
        const result = await SaleReturn.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activateSaleReturn = async (req, res, next) => {
    try {
        const result = await SaleReturn.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
