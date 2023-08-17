'use strict';
const TreatmentVoucher = require('../models/treatmentVoucher');
const MedicineItems = require('../models/medicineItem');
const Transaction = require('../models/transaction');
const Accounting = require('../models/accountingList');
const path = require('path');
const UserUtil = require('../lib/userUtil');
const TreatmentSelection = require('../models/treatmentSelection');
const Attachment = require('../models/attachment');

exports.listAllTreatmentVouchers = async (req, res) => {
    let { keyword, role, limit, skip, tsType } = req.query;
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
        if (tsType) query.tsType = tsType
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
    const result = await TreatmentVoucher.find(query).populate('createdBy relatedTreatment relatedAppointment relatedPatient relatedTreatmentSelection multiTreatment.item_id relatedCash relatedBank relatedDoctor')
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};


exports.excelImportTreatmentVouchers = async (req, res) => {
    try {
        let files = req.files
        if (files.excel) {
            for (const i of files.excel) {
                const subpath = path.join('app', 'controllers');  // Construct the subpath using the platform's path separator
                const newPath = __dirname.replace(subpath, '');
                const dest = path.join(newPath, i.path)
                const data = await UserUtil.readExcelDataForTreatmentVoucher(dest)
                await TreatmentVoucher.insertMany(data).then((response) => {
                    return res.status(200).send({
                        success: true, data: response
                    })
                })
                    .catch(error => {
                        return res.status(500).send({ error: true, message: error })
                    })
            }
        }
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message })
    }

}

exports.getRelatedTreatmentVoucher = async (req, res) => {
    try {
        let { relatedPatient, startDate, endDate, createdBy, bankType, tsType, relatedDoctor, relatedTreatmentSelection } = req.body
        let query = { isDeleted: false };
        if (startDate && endDate) query.createdAt = { $gte: startDate, $lte: endDate }
        if (relatedPatient) query.relatedPatient = relatedPatient
        if (bankType) query.bankType = bankType
        if (createdBy) query.createdBy = createdBy
        if (tsType) query.tsType = tsType
        if (relatedTreatmentSelection) query.relatedTreatmentSelection = relatedTreatmentSelection
        console.log(query, relatedDoctor)
        let result = await TreatmentVoucher.find(query).populate('relatedTreatment relatedBank relatedCash relatedPatient relatedTreatmentSelection relatedAccounting payment createdBy').populate({
            path: 'relatedTreatmentSelection',
            model: 'TreatmentSelections',
            populate: {
                path: 'relatedAppointments',
                model: 'Appointments',
                populate: {
                    path: 'relatedDoctor',
                    model: 'Doctors'
                }
            }
        })
        if (relatedDoctor) {
            result = result.filter(item => {
                if (item.relatedTreatmentSelection && Array.isArray(item.relatedTreatmentSelection.relatedAppointments)) {
                    const hasMatchingAppointment = item.relatedTreatmentSelection.relatedAppointments.some(
                        i => i.relatedDoctor && i.relatedDoctor._id && i.relatedDoctor._id.toString() === relatedDoctor
                    );
                    console.log(hasMatchingAppointment);
                    return hasMatchingAppointment;
                } else {
                    return false; // Or handle the case when there are no relatedAppointments as needed
                }
            });
        }

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

exports.getCodeMS = async (req, res) => {
    let data = {}
    try {
        let today = new Date().toISOString()
        const latestDocument = await TreatmentVoucher.find({ tsType: 'MS' }, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
        if (latestDocument.length === 0) data = { ...data, seq: 1, code: "MVC-" + today.split('T')[0].replace(/-/g, '') + "-1" } // if seq is undefined set initial patientID and seq
        if (latestDocument.length > 0) {
            const increment = latestDocument[0].seq + 1
            data = { ...data, code: "MVC-" + today.split('T')[0].replace(/-/g, '') + "-" + increment, seq: increment }
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
        let data = req.body
        const { msType, multiTreatment, relatedTreatmentSelection, id } = req.body;
        let parsedMulti = JSON.parse(multiTreatment)
        let parsedTS = JSON.parse(relatedTreatmentSelection)
        let TSArray = []
        let files = req.files
        if (files.payment) {
            for (const element of files.payment) {
                let imgPath = element.path.split('cherry-k')[1];
                const attachData = {
                    fileName: element.originalname,
                    imgUrl: imgPath,
                    image: 'payment'
                };
                const attachResult = await Attachment.create(attachData);
                console.log(attachResult, 'result')
                attachID = attachResult._id
            }
        }
        if (msType === 'TSMulti') {
            for (const item of parsedTS) {
                await TreatmentSelection.findOneAndDelete({ _id: item }).then(res => {
                    console.log(item + ' is Deleted')
                })
            }
            for (const i of parsedMulti) {
                data.multiTreatment = parsedMulti
                data.relatedTreatment = i.item_id
                data.totalAmount = i.price
                data.discount = i.discountAmount
                let result = await TreatmentSelection.create(data)
                TSArray.push(result._id)
            }
            data.relatedTreatmentSelection = TSArray
            data.multiTreatment = parsedMulti
        }
        const result = await TreatmentVoucher.findOneAndUpdate(
            { _id: id },
            data,
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
    let response = {
        success: true,
        data: {}
    }
    try {
        const { startDate, endDate, createdBy, purchaseType, relatedDoctor, bankType, tsType, relatedPatient, bankID } = req.query
        if (startDate && endDate) query.createdAt = { $gte: startDate, $lte: endDate }
        if (relatedPatient) query.relatedPatient = relatedPatient
        if (bankType) query.bankType = bankType
        if (createdBy) query.createdBy = createdBy
        if (tsType) query.tsType = tsType
        if (bankID) query.relatedBank = bankID
        if (purchaseType) query.purchaseType = purchaseType
        if (relatedDoctor) query.relatedDoctor = relatedDoctor
        let bankResult = await TreatmentVoucher.find(query).populate('relatedTreatment relatedDoctor relatedBank relatedCash relatedPatient relatedTreatmentSelection relatedAccounting payment createdBy').populate({
            path: 'relatedTreatmentSelection',
            model: 'TreatmentSelections',
            populate: {
                path: 'relatedAppointments',
                model: 'Appointments',
                populate: {
                    path: 'relatedDoctor',
                    model: 'Doctors'
                }
            }
        })
        if (!bankID) {
            const { relatedBank, ...query2 } = query;
            query2.relatedCash = { $exists: true };
            let cashResult = await TreatmentVoucher.find(query2).populate('relatedTreatment relatedDoctor relatedBank relatedCash relatedPatient relatedTreatmentSelection relatedAccounting payment createdBy').populate({
                path: 'relatedTreatmentSelection',
                model: 'TreatmentSelections',
                populate: {
                    path: 'relatedAppointments',
                    model: 'Appointments',
                    populate: {
                        path: 'relatedDoctor',
                        model: 'Doctors'
                    }
                }
            })
            const CashNames = cashResult.reduce((result, { relatedCash, paidAmount, msTotalAmount, totalPaidAmount }) => {
                const { name } = relatedCash;
                result[name] = (result[name] || 0) + paidAmount + msTotalAmount + totalPaidAmount;
                return result;
            }, {});
            const CashTotal = cashResult.reduce((total, sale) => total + sale.paidAmount + sale.msTotalAmount + sale.totalPaidAmount, 0);
            response.data = { ...response.data, CashList: cashResult, CashNames: CashNames, CashTotal: CashTotal }
        }
        //filter solid beauty
        const BankNames = bankResult.reduce((result, { relatedBank, paidAmount, msTotalAmount, totalPaidAmount }) => {
            const { name } = relatedBank;
            result[name] = (result[name] || 0) + paidAmount + msTotalAmount + totalPaidAmount;
            return result;
        }, {});
        const BankTotal = bankResult.reduce((total, sale) => total + sale.paidAmount + sale.msTotalAmount + sale.totalPaidAmount, 0);
        response.data = { ...response.data, BankList: bankResult, BankNames: BankNames, BankTotal: BankTotal }

        return res.status(200).send(response);
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

exports.createSingleMedicineSale = async (req, res) => {
    console.log('here')
    let data = req.body;
    let { remark, relatedBank, relatedCash, msPaidAmount, medicineItems } = req.body;
    let createdBy = req.credentials.id;

    //_________COGS___________
    const medicineResult = await MedicineItems.find({ _id: { $in: medicineItems.map(item => item.item_id) } })
    const purchaseTotal = medicineResult.reduce((accumulator, currentValue) => accumulator + currentValue.purchasePrice, 0)

    const inventoryResult = Transaction.create({
        "amount": purchaseTotal,
        "date": Date.now(),
        "remark": remark,
        "relatedAccounting": "64a8e06755a87deaea39e17b", //Medicine inventory
        "type": "Credit",
        "createdBy": createdBy
    })
    var inventoryAmountUpdate = await Accounting.findOneAndUpdate(
        { _id: "64a8e06755a87deaea39e17b" },  // Medicine inventory
        { $inc: { amount: -purchaseTotal } }
    )
    const COGSResult = Transaction.create({
        "amount": purchaseTotal,
        "date": Date.now(),
        "remark": remark,
        "relatedAccounting": "64a8e10b55a87deaea39e193", //Medicine Sales COGS
        "type": "Debit",
        "relatedTransaction": inventoryResult._id,
        "createdBy": createdBy
    })
    var inventoryUpdate = await Transaction.findOneAndUpdate(
        { _id: inventoryResult._id },
        {
            relatedTransaction: COGSResult._id
        },
        { new: true }
    )
    var COGSUpdate = await Accounting.findOneAndUpdate(
        { _id: "64a8e10b55a87deaea39e193" },  //Medicine Sales COGS
        { $inc: { amount: purchaseTotal } }
    )
    //_________END_OF_COGS___________

    //..........Transaction.............................
    const fTransaction = new Transaction({
        "amount": data.msPaidAmount,
        "date": Date.now(),
        "remark": remark,
        "relatedAccounting": "648095b57d7e4357442aa457", //Sales Medicines
        "type": "Credit",
        "createdBy": createdBy
    })
    const fTransResult = await fTransaction.save()
    var amountUpdate = await Accounting.findOneAndUpdate(
        { _id: "648095b57d7e4357442aa457" },  //Sales Medicines
        { $inc: { amount: data.msPaidAmount } }
    )
    //sec transaction
    const secTransaction = new Transaction(
        {
            "amount": data.msPaidAmount,
            "date": Date.now(),
            "remark": remark,
            "relatedBank": relatedBank,
            "relatedCash": relatedCash,
            "type": "Debit",
            "relatedTransaction": fTransResult._id,
            "createdBy": createdBy
        }
    )
    const secTransResult = await secTransaction.save();
    var fTransUpdate = await Transaction.findOneAndUpdate(
        { _id: fTransResult._id },
        {
            relatedTransaction: secTransResult._id
        },
        { new: true }
    )
    if (relatedBank) {
        var amountUpdate = await Accounting.findOneAndUpdate(
            { _id: relatedBank },
            { $inc: { amount: data.msPaidAmount } }
        )
    } else if (relatedCash) {
        var amountUpdate = await Accounting.findOneAndUpdate(
            { _id: relatedCash },
            { $inc: { amount: data.msPaidAmount } }
        )
    }
    let objID = ''
    if (relatedBank) objID = relatedBank
    if (relatedCash) objID = relatedCash
    //transaction
    const acc = await Accounting.find({ _id: objID })
    if (acc.length > 0) {
        const accResult = await Accounting.findOneAndUpdate(
            { _id: objID },
            { amount: data.msPaidAmount + parseInt(acc[0].amount) },
            { new: true },
        )
    }

    data = { ...data, relatedTransaction: [fTransResult._id, secTransResult._id], createdBy: createdBy, purchaseTotal: purchaseTotal }
    if (purchaseTotal) data.purchaseTotal = purchaseTotal
    //..........END OF TRANSACTION.....................

    const newMedicineSale = new TreatmentVoucher(data)
    const medicineSaleResult = await newMedicineSale.save()
    res.status(200).send({
        message: 'MedicineSale Transaction success',
        success: true,
        data: medicineSaleResult
    });

}

exports.combineMedicineSale = async (req, res) => {
    let data = req.body;
    let { remark, relatedBank, relatedCash, msPaidAmount, medicineItems, id } = req.body;
    let createdBy = req.credentials.id;

    //_________COGS___________
    const medicineResult = await MedicineItems.find({ _id: { $in: medicineItems.map(item => item.item_id) } })
    const purchaseTotal = medicineResult.reduce((accumulator, currentValue) => accumulator + currentValue.purchasePrice, 0)

    const inventoryResult = Transaction.create({
        "amount": purchaseTotal,
        "date": Date.now(),
        "remark": remark,
        "relatedAccounting": "64a8e06755a87deaea39e17b", //Medicine inventory
        "type": "Credit",
        "createdBy": createdBy
    })
    var inventoryAmountUpdate = await Accounting.findOneAndUpdate(
        { _id: "64a8e06755a87deaea39e17b" },  // Medicine inventory
        { $inc: { amount: -purchaseTotal } }
    )
    const COGSResult = Transaction.create({
        "amount": purchaseTotal,
        "date": Date.now(),
        "remark": remark,
        "relatedAccounting": "64a8e10b55a87deaea39e193", //Medicine Sales COGS
        "type": "Debit",
        "relatedTransaction": inventoryResult._id,
        "createdBy": createdBy
    })
    var inventoryUpdate = await Transaction.findOneAndUpdate(
        { _id: inventoryResult._id },
        {
            relatedTransaction: COGSResult._id
        },
        { new: true }
    )
    var COGSUpdate = await Accounting.findOneAndUpdate(
        { _id: "64a8e10b55a87deaea39e193" },  //Medicine Sales COGS
        { $inc: { amount: purchaseTotal } }
    )
    //_________END_OF_COGS___________

    //..........Transaction.............................
    const fTransaction = new Transaction({
        "amount": data.msPaidAmount,
        "date": Date.now(),
        "remark": remark,
        "relatedAccounting": "648095b57d7e4357442aa457", //Sales Medicines
        "type": "Credit",
        "createdBy": createdBy
    })
    const fTransResult = await fTransaction.save()
    var amountUpdate = await Accounting.findOneAndUpdate(
        { _id: "648095b57d7e4357442aa457" },  //Sales Medicines
        { $inc: { amount: data.msPaidAmount } }
    )
    //sec transaction
    const secTransaction = new Transaction(
        {
            "amount": data.msPaidAmount,
            "date": Date.now(),
            "remark": remark,
            "relatedBank": relatedBank,
            "relatedCash": relatedCash,
            "type": "Debit",
            "relatedTransaction": fTransResult._id,
            "createdBy": createdBy
        }
    )
    const secTransResult = await secTransaction.save();
    var fTransUpdate = await Transaction.findOneAndUpdate(
        { _id: fTransResult._id },
        {
            relatedTransaction: secTransResult._id
        },
        { new: true }
    )
    if (relatedBank) {
        var amountUpdate = await Accounting.findOneAndUpdate(
            { _id: relatedBank },
            { $inc: { amount: data.msPaidAmount } }
        )
    } else if (relatedCash) {
        var amountUpdate = await Accounting.findOneAndUpdate(
            { _id: relatedCash },
            { $inc: { amount: data.msPaidAmount } }
        )
    }
    let objID = ''
    if (relatedBank) objID = relatedBank
    if (relatedCash) objID = relatedCash
    //transaction
    const acc = await Accounting.find({ _id: objID })
    if (acc.length > 0) {
        const accResult = await Accounting.findOneAndUpdate(
            { _id: objID },
            { amount: parseInt(msPaidAmount) + parseInt(acc[0].amount) },
            { new: true },
        )
    }
    data = { ...data, relatedTransaction: [fTransResult._id, secTransResult._id], createdBy: createdBy, purchaseTotal: purchaseTotal }
    if (purchaseTotal) data.purchaseTotal = purchaseTotal
    //..........END OF TRANSACTION.....................

    const medicineSaleResult = await TreatmentVoucher.findOneAndUpdate(
        { _id: id },
        data,
        { new: true }
    )
    res.status(200).send({
        message: 'MedicineSale Combination success',
        success: true,
        data: medicineSaleResult
    });

}
