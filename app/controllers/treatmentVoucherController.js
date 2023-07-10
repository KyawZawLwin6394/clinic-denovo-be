'use strict';
const TreatmentVoucher = require('../models/treatmentVoucher');

exports.listAllTreatmentVouchers = async (req, res) => {
    let { keyword, role, limit, skip } = req.query;
    let count = 0;
    let page = 0;
    try {
        limit = +limit <= 100 ? +limit : 20; //limit
        skip = +skip || 0;
        let query = { isDeleted: false },
            regexKeyword;
        role ? (query['role'] = role.toUpperCase()) : '';
        keyword && /\w/.test(keyword)
            ? (regexKeyword = new RegExp(keyword, 'i'))
            : '';
        regexKeyword ? (query['name'] = regexKeyword) : '';
        let result = await TreatmentVoucher.find(query).populate('createdBy relatedTreatment relatedAppointment relatedPatient payment relatedTreatmentSelection relatedBranch')
        count = await TreatmentVoucher.find(query).count();
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

exports.getTreatmentVoucherWithTreatmentID = async (req, res) => {
    let query = { isDeleted: false }
    if (req.params.id) query.relatedTreatmentSelection = req.params.id
    const result = await TreatmentVoucher.find(query).populate('createdBy relatedTreatment relatedAppointment relatedPatient')
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.getTreatmentVoucher = async (req, res) => {
    let query = { isDeleted: false }
    if (req.params.id) query._id = req.params.id
    const result = await TreatmentVoucher.find(query).populate('createdBy relatedTreatment relatedAppointment relatedPatient relatedTreatmentSelection')
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.getRelatedTreatmentVoucher = async (req, res) => {
    try {
        let query = { isDeleted: false };
        let { relatedPatient, relatedTreatment, start, end, treatmentSelection, createdBy } = req.body
        if (start && end) query.createdAt = { $gte: start, $lte: end }
        if (relatedPatient) query.relatedPatient = relatedPatient
        if (relatedTreatment) query.relatedTreatment = relatedTreatment
        if (treatmentSelection) query.relatedTreatmentSelection = treatmentSelection
        if (createdBy) query.createdBy = createdBy
        const result = await TreatmentVoucher.find(query).populate('createdBy relatedTreatment relatedAppointment relatedPatient relatedTreatmentSelection')
        if (!result)
            return res.status(404).json({ error: true, message: 'No Record Found' });
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: true, message: 'An Error Occured While Fetching Related Treatment Vouchers' })
    }
};

exports.searchTreatmentVoucher = async (req, res, next) => {
    try {
        let query = { isDeleted: false }
        let { search, relatedPatient } = req.body
        if (relatedPatient) query.relatedPatient = relatedPatient
        if (search) query.$text = { $search: search }
        const result = await TreatmentVoucher.find(query).populate('createdBy relatedTreatment relatedAppointment relatedPatient relatedTreatmentSelection')
        if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' })
        return res.status(200).send({ success: true, data: result })
    } catch (err) {
        return res.status(500).send({ error: true, message: err.message })
    }
}

exports.getCode = async (req, res) => {
    let data = {}
    try {
        let today = new Date().toISOString()
        const latestDocument = await TreatmentVoucher.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
        if (latestDocument.length === 0) data = { ...data, seq: 1, code: "TVC-" + today.split('T')[0].replace(/-/g, '') + "-1" } // if seq is undefined set initial patientID and seq
        if (latestDocument.length > 0) {
            const increment = latestDocument[0].seq + 1
            data = { ...data, code: "TVC-" + today.split('T')[0].replace(/-/g, '') + "-" + increment, seq: increment }
        }
        return res.status(200).send({ success: true, data: data })
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
}

exports.createTreatmentVoucher = async (req, res, next) => {
    let data = req.body;
    try {

        const newTreatmentVoucher = new TreatmentVoucher(data);
        const result = await newTreatmentVoucher.save();
        res.status(200).send({
            message: 'TreatmentVoucher create success',
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateTreatmentVoucher = async (req, res, next) => {
    try {
        const result = await TreatmentVoucher.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('createdBy relatedTreatment relatedAppointment relatedPatient');
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteTreatmentVoucher = async (req, res, next) => {
    try {
        const result = await TreatmentVoucher.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activateTreatmentVoucher = async (req, res, next) => {
    try {
        const result = await TreatmentVoucher.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.getTodaysTreatmentVoucher = async (req, res) => {
    try {
        let query = { isDeleted: false }
        var start = new Date();
        var end = new Date();
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        if (start && end) query.originalDate = { $gte: start, $lt: end }
        const result = await TreatmentVoucher.find(query).populate('createdBy relatedAppointment relatedPatient').populate({
            path: 'relatedTreatment',
            model: 'Treatments',
            populate: {
                path: 'treatmentName',
                model: 'TreatmentLists'
            }
        })
        if (result.length === 0) return res.status(404).json({ error: true, message: 'No Record Found!' })
        return res.status(200).send({ success: true, data: result })
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message })
    }
}

exports.getwithExactDate = async (req, res) => {
    try {
        let { exact } = req.query;
        const date = new Date(exact);
        const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Set start date to the beginning of the day
        const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1); // Set end date to the beginning of the next day
        let result = await TreatmentVoucher.find({ createdAt: { $gte: startDate, $lt: endDate } }).populate('createdBy relatedAppointment relatedPatient relatedCash').populate({
            path: 'relatedTreatment',
            model: 'Treatments',
            populate: {
                path: 'treatmentName',
                model: 'TreatmentLists'
            }
        })
        //.populate('createdBy relatedTreatment relatedAppointment relatedPatient');
        if (result.length <= 0) return res.status(404).send({ error: true, message: 'Not Found!' });
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message });
    }
};

exports.TreatmentVoucherFilter = async (req, res) => {
    let query = { relatedBank: { $exists: true }, isDeleted: false }
    try {
        const { start, end, relatedBranch, createdBy, purchaseType } = req.query
        if (start && end) query.createdAt = { $gte: start, $lt: end }
        if (relatedBranch) query.relatedBranch = relatedBranch
        if (createdBy) query.createdBy = createdBy
        if (relatedDoctor) query.relatedDoctor = relatedDoctor
        let bankResult = await TreatmentVoucher.find(query).populate('relatedTreatment relatedAppointment relatedBank relatedCash relatedPatient relatedTreatmentSelection relatedBranch relatedAccounting payment createdBy')
        const { relatedBank, ...query2 } = query;
        query2.relatedCash = { $exists: true };
        let cashResult = await TreatmentVoucher.find(query2).populate('relatedTreatment relatedAppointment relatedBank relatedCash relatedPatient relatedTreatmentSelection relatedBranch relatedAccounting payment createdBy')
        if (purchaseType) {
            cashResult = cashResult.filter(item => item.relatedTreatmentSelection.purchaseType === purchaseType)
            bankResult = bankResult.filter(item => item.relatedTreatmentSelection.purchaseType === purchaseType)
        }
        //filter solid beauty
        const BankNames = bankResult.reduce((result, { relatedBank, amount }) => {
            const { name } = relatedBank;
            result[name] = (result[name] || 0) + amount;
            return result;
        }, {});
        const CashNames = cashResult.reduce((result, { relatedCash, amount }) => {
            const { name } = relatedCash;
            result[name] = (result[name] || 0) + amount;
            return result;
        }, {});
        const BankTotal = bankResult.reduce((total, sale) => total + sale.amount, 0);
        const CashTotal = cashResult.reduce((total, sale) => total + sale.amount, 0);

        return res.status(200).send({
            success: true,
            data: {
                BankList: bankResult,
                CashList: cashResult,
                BankNames: BankNames,
                CashNames: CashNames,
                BankTotal: BankTotal,
                CashTotal: CashTotal
            }
        });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message })
    }
}

exports.filterTreatmentVoucher = async (req, res, next) => {
    try {
        let query = { isDeleted: false }
        let { startDate, endDate, relatedDoctor, relatedPatient } = req.query
        if (startDate && endDate) query.createdAt = { $gte: startDate, $lte: endDate }
        if (relatedDoctor) query.relatedDoctor = relatedDoctor
        if (relatedPatient) query.relatedPatient = relatedPatient
        if (Object.keys(query).length === 0) return res.status(404).send({ error: true, message: 'Please Specify A Query To Use This Function' })
        const result = await TreatmentVoucher.find(query).populate('createdBy relatedTreatment relatedAppointment relatedPatient payment relatedTreatmentSelection relatedBranch')
        if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
        res.status(200).send({ success: true, data: result })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ error: true, message: err.message })
    }
}
