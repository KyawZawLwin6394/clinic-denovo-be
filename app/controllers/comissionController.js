'use strict';
const Comission = require('../models/comission');
const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const ComissionPay = require('../models/commissionPay');
const { ObjectId } = require('mongodb');
const Transaction = require('../models/transaction');
const Accounting = require('../models/accountingList')

exports.listAllComissiones = async (req, res) => {
    let { keyword, role, limit, skip } = req.query;
    let count = 0;
    let page = 0;
    try {
        limit = +limit <= 100 ? +limit : 10; //limit
        skip = +skip || 0;
        let query = {},
            regexKeyword;
        role ? (query['role'] = role.toUpperCase()) : '';
        keyword && /\w/.test(keyword)
            ? (regexKeyword = new RegExp(keyword, 'i'))
            : '';
        regexKeyword ? (query['name'] = regexKeyword) : '';
        let result = await Comission.find(query)
        count = await Comission.find(query).count();
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

exports.getComission = async (req, res) => {
    const result = await Comission.find({ _id: req.params.id, isDeleted: false }).populate('procedureMedicine.item_id medicineLists.item_id procedureAccessory.item_id relatedComission')
    if (result.length === 0)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createComission = async (req, res, next) => {
    let percent = 0.05
    let data = req.body
    let appointmentResult = await Appointment.find({ _id: req.body.appointmentID })
    //if (appointmentResult[0].isCommissioned === true) return res.status(500).send({ error: true, message: 'Alread Commissioned!' })
    let comission = (req.body.totalAmount / req.body.treatmentTimes) * percent
    let doctorUpdate = await Doctor.findOneAndUpdate(
        { _id: req.body.doctorID },
        { commissionAmount: comission }
    )
    let appointmentUpdate = await Appointment.findOneAndUpdate(
        { _id: req.body.appointmentID },
        { isCommissioned: true }
    )
    let newBody = req.body;
    try {
        const newComission = new Comission(newBody);
        const result = await Comission.create({
            relatedAppointment: req.body.appointmentID,
            appointmentAmount: req.body.totalAmount / req.body.treatmentTimes,
            commissionAmount: comission,
            relatedDoctor: req.body.doctorID,
            percent: percent
        }).then(async (response) => {
            const TransactionResult = await Transaction.create({
                "amount": comission,
                "date": Date.now(),
                "remark": data.remark,
                "type": "Credit",
                "relatedTransaction": null,
                "relatedAccounting": "64ae1d0012b3d31436d48027", //Sales Comission
            })
            const amountUpdate = await Accounting.findOneAndUpdate(
                { _id: '64ae1d0012b3d31436d48027' },
                { $inc: { amount: comission } }
            )
        })
        res.status(200).send({
            message: 'Comission create success',
            success: true,
            data: result,
            doctorResult: doctorUpdate
        });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateComission = async (req, res, next) => {
    try {
        const result = await Comission.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('procedureMedicine.item_id medicineLists.item_id procedureAccessory.item_id relatedComission')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteComission = async (req, res, next) => {
    try {
        const result = await Comission.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activateComission = async (req, res, next) => {
    try {
        const result = await Comission.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.searchCommission = async (req, res) => {
    let total = 0
    console.log('here')
    try {
        const { month, doctor } = req.query;
        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

        //Check if the provided month value is valid
        if (!months.includes(month)) {
            return res.status(400).json({ error: 'Invalid month' });
        }

        // Get the start and end dates for the specified month
        const startDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(month), 1));
        const endDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(month) + 1, 1));
        console.log(startDate, endDate)
        let query = { status: 'Unclaimed' }
        if (month) query.date = { $gte: startDate, $lte: endDate }
        if (doctor) query.relatedDoctor = doctor
        const result = await Comission.find(query).populate('relatedDoctor relatedAppointment')
        for (let i = 0; i < result.length; i++) {
            total = result[i].commissionAmount + total
        }

        return res.status(200).send({ success: true, data: result, collectAmount: total, startDate: startDate, endDate: endDate })
    } catch (e) {
        return res.status(500).send({ error: true, message: e.message });
    }
};

exports.collectComission = async (req, res) => {
    try {
        let { update, startDate, endDate, collectAmount, remark, relatedDoctor } = req.body
        // Convert string IDs to MongoDB ObjectIds
        const objectIds = update.map((id) => ObjectId(id));

        // Perform the update operation
        const updateResult = await Comission.updateMany(
            { _id: { $in: objectIds } }, // Use $in operator to match multiple IDs
            { status: 'Claimed' },
            { new: true }
        );
        const cPayResult = await ComissionPay.create({
            startDate: startDate,
            endDate: endDate,
            collectAmount: collectAmount,
            remark: remark,
            relatedDoctor: relatedDoctor,
            relatedCommissions: objectIds
        })
        return res.status(200).send({ success: true, updateResult: updateResult, comissionPayResult: cPayResult })
    } catch (e) {
        return res.status(500).send({ error: true, message: e.message });
    }
}
