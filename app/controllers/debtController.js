'use strict';
const Debt = require('../models/debt');
const TreatmentVoucher = require('../models/treatmentVoucher');
const AccountingList = require('../models/accountingList');
const Transaction = require('../models/transaction');
const Patient = require('../models/patient');
exports.listAllDebts = async (req, res) => {
    try {
        const { isPaid } = req.query
        let query = { isDeleted: false }
        if (isPaid) query.isPaid = isPaid
        let result = await Debt.find(query);
        let count = await Debt.find(query).count();
        res.status(200).send({
            success: true,
            count: count,
            data: result
        });
    } catch (error) {
        return res.status(500).send({ error: true, message: 'No Record Found!' });
    }
};

exports.getDebt = async (req, res) => {
    const result = await Debt.find({ relatedPatient: req.params.id, isDeleted: false }).populate('relatedPatient relatedTreatmentVoucher relatedMedicineSale');
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createDebt = async (req, res, next) => {
    try {
        const newDebt = new Debt(req.body);
        const result = await newDebt.save();
        res.status(200).send({
            message: 'Debt create success',
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateDebt = async (req, res, next) => {
    try {
        const { relatedTreatmentVoucher, relatedBank, relatedCash, paidAmount, relatedBranch, date, remark, relatedPatient } = req.body
        if (relatedBank) {
            const transaction = await Transaction.create({
                "amount": paidAmount,
                "date": date,
                "remark": remark,
                "type": "Debit",
                "relatedBank": relatedBank,
                "relatedCash": relatedCash,
                "relatedBranch": relatedBranch
            })
            const update = await AccountingList.findOneAndUpdate({ _id: relatedBank }, { amount: paidAmount }, { new: true })
        }
        if (relatedCash) {
            const transaction = await Transaction.create({
                "amount": paidAmount,
                "date": date,
                "remark": remark,
                "type": "Debit",
                "relatedBank": relatedBank,
                "relatedCash": relatedCash,
                "relatedBranch": relatedBranch
            })
            const update = await AccountingList.findOneAndUpdate({ _id: relatedCash }, { amount: paidAmount }, { new: true })
        }
        if (paidAmount && relatedPatient) {
            const payDebt = await Patient.findOneAndUpdate({ _id: relatedPatient }, { $inc: { debtBalance: paidAmount } })
        }
        const result = await Debt.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        );
        const update = await TreatmentVoucher.findOneAndUpdate({ _id: relatedTreatmentVoucher }, { paymentMethod: 'Paid' }, { new: true })
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteDebt = async (req, res, next) => {
    try {
        const result = await Debt.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
};

exports.activateDebt = async (req, res, next) => {
    try {
        const result = await Debt.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
