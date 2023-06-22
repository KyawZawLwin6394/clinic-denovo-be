'use strict';
const PackageSelection = require('../models/packageSelection');
const Appointment = require('../models/appointment');
const Transaction = require('../models/transaction');
const Patient = require('../models/patient');
const PackageVoucher = require('../models/packageVoucher');
const Repay = require('../models/repayRecord');
const Accounting = require('../models/accountingList');
const Attachment = require('../models/attachment');

exports.listAllPackageSelections = async (req, res) => {
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
        let result = await PackageSelection.find(query).populate('createdBy relatedBranch relatedTreatmentList relatedAppointments relatedPatient finishedAppointments remainingAppointments relatedTransaction').populate({
            path: 'relatedTreatment',
            model: 'Treatments',
            populate: {
                path: 'relatedDoctor',
                model: 'Doctors'
            }
        })
        let count = await PackageSelection.find(query).count();
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
    } catch (error) {
        return res.status(500).send({ error: true, message: 'No Record Found!' });
    }
};

exports.getPackageSelection = async (req, res) => {
    let query = req.mongoQuery
    if (req.params.id) query._id = req.params.id
    const result = await PackageSelection.find(query).populate('createdBy relatedAppointments remainingAppointments relatedTransaction relatedPatient relatedTreatmentList').populate({
        path: 'relatedTreatment',
        populate: [{
            path: 'relatedDoctor',
            model: 'Doctors'
        }, {
            path: 'procedureMedicine.item_id',
            model: 'ProcedureItems'
        },
        {
            path: 'procedureAccessory.item_id',
            model: 'AccessoryItems'
        },
        {
            path: 'machine.item_id',
            model: 'FixedAssets'
        }]
    });
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.getTreatementSelectionByTreatmentID = async (req, res) => {
    let query = req.mongoQuery
    if (req.params.id) query.relatedTreatment = req.params.id
    const result = await PackageSelection.find(query).populate('createdBy relatedAppointments remainingAppointments relatedTransaction relatedPatient relatedTreatmentList').populate({
        path: 'relatedTreatment',
        model: 'Treatments',
        populate: {
            path: 'relatedDoctor',
            model: 'Doctors'
        }
    })
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createPackageSelectionCode = async (req, res) => {
    let data = req.body;
    try {
        //prepare TS-ID
        const latestDocument = await PackageSelection.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
        if (latestDocument[0].seq === undefined) data = { ...data, seq: 1, code: "TS-1" } // if seq is undefined set initial patientID and seq
        if (latestDocument[0].seq) {
            const increment = latestDocument[0].seq + 1
            data = { ...data, code: "TS-" + increment, seq: increment }
        }
        return res.status(200).send({
            success: true,
            data: data
        })
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message })
    }
}

exports.createPackageSelection = async (req, res, next) => {
    let data = req.body;
    let relatedAppointments = []
    let tvcCreate = false;
    let createdBy = req.credentials.id
    let files = req.files
    try {
        if (req.body.originalDate === undefined) return res.status(500).send({ error: true, message: 'Original Date is required' })
        const appointmentConfig = {
            relatedPatient: req.body.relatedPatient,
            relatedDoctor: req.body.relatedDoctor,
            originalDate: new Date(req.body.originalDate), // Convert to Date object
            phone: req.body.phone,
            relatedBranch: req.body.relatedBranch
        };
        console.log(appointmentConfig)
        const numTreatments = req.body.treatmentTimes;
        const dataconfigs = [];

        for (let i = 0; i < numTreatments; i++) {
            const date = new Date(appointmentConfig.originalDate);
            date.setDate(date.getDate() + (i * req.body.inBetweenDuration)); // Add 7 days for each iteration
            const config = { ...appointmentConfig, originalDate: date };
            dataconfigs.push(config);
        }
        const appointmentResult = await Appointment.insertMany(dataconfigs)
        appointmentResult.map(function (element, index) {
            relatedAppointments.push(element._id)
        })

        if (files.payment) {
            for (const element of files.payment) {
                let imgPath = element.path.split('cherry-k')[1];
                const attachData = {
                    fileName: element.originalname,
                    imgUrl: imgPath,
                    image: imgPath.split('\\')[2]
                };
                const attachResult = await Attachment.create(attachData);
                var attachID = attachResult._id.toString()
            }
        }

        const patientUpdate = await Patient.findOneAndUpdate(
            { _id: req.body.relatedPatient },
            { $inc: { conditionAmount: req.body.totalAmount, conditionPurchaseFreq: 1, conditionPackageQty: 1 } },
            { new: true }
        )

        data = { ...data, relatedAppointments: relatedAppointments, remainingAppointments: relatedAppointments, createdBy: createdBy, relatedBranch: req.mongoQuery.relatedBranch }
        console.log(data, 'data1')
        //first transaction 
        if (req.body.paymentMethod === 'Cash Down') {
            var fTransResult = await Transaction.create({
                "amount": req.body.paidAmount,
                "date": Date.now(),
                "remark": null,
                "relatedAccounting": "6467379159a9bc811d97f4d2", //Advance received from customer
                "type": "Credit",
                "createdBy": createdBy
            })
            var amountUpdate = await Accounting.findOneAndUpdate(
                { _id: "6467379159a9bc811d97f4d2" },
                { $inc: { amount: req.body.paidAmount } }
            )
            //sec transaction
            var secTransResult = await Transaction.create({
                "amount": req.body.paidAmount,
                "date": Date.now(),
                "remark": null,
                "relatedBank": req.body.relatedBank,
                "relatedCash": req.body.relatedCash,
                "type": "Debit",
                "relatedTransaction": fTransResult._id,
                "createdBy": createdBy
            });
            var fTransUpdate = await Transaction.findOneAndUpdate(
                { _id: fTransResult._id },
                {
                    relatedTransaction: secTransResult._id
                },
                { new: true }
            )
            if (req.body.relatedBank) {
                var amountUpdate = await Accounting.findOneAndUpdate(
                    { _id: req.body.relatedBank },
                    { $inc: { amount: req.body.paidAmount } }
                )
            } else if (req.body.relatedCash) {
                var amountUpdate = await Accounting.findOneAndUpdate(
                    { _id: req.body.relatedCash },
                    { $inc: { amount: req.body.paidAmount } }
                )
            }
            tvcCreate = true;
        }
        if (fTransResult && secTransResult) { data = { ...data, relatedTransaction: [fTransResult._id, secTransResult._id] } } //adding relatedTransactions to packageSelection model
        if (packageVoucherResult) { data = { ...data, relatedPackageVoucher: packageVoucherResult._id } }
        console.log(data, 'data2')
        const result = await PackageSelection.create(data)

        if (req.body.paymentMethod === 'FOC') {
            let dataTVC = {
                "relatedPackageSelection": result._id,
                "relatedTreatment": req.body.relatedTreatment,
                "relatedAppointment": req.body.relatedAppointment,
                "relatedPatient": req.body.relatedPatient,
                "paymentMethod": "FOC", //enum: ['by Appointment','Lapsum','Total','Advanced']
                "amount": req.body.paidAmount,
                "relatedBank": req.body.relatedBank,
                "bankType": req.body.bankType,//must be bank acc from accounting accs
                "paymentType": req.body.paymentType, //enum: ['Bank','Cash']
                "relatedCash": req.body.relatedCash, //must be cash acc from accounting accs
                "createdBy": createdBy,
                "relatedBranch": req.body.relatedBranch,
                "remark": req.body.remark,
                "payment": attachID
            }
            let today = new Date().toISOString()
            const latestDocument = await PackageVoucher.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
            if (latestDocument.length === 0) dataTVC = { ...dataTVC, seq: 1, code: "TVC-" + today.split('T')[0].replace(/-/g, '') + "-1" } // if seq is undefined set initial patientID and seq
            if (latestDocument.length > 0) {
                const increment = latestDocument[0].seq + 1
                dataTVC = { ...dataTVC, code: "TVC-" + today.split('T')[0].replace(/-/g, '') + "-" + increment, seq: increment }
            }
            var packageVoucherResult = await PackageVoucher.create(dataTVC)
        }
        if (tvcCreate === true) {
            //--> treatment voucher create
            let dataTVC = {
                "relatedPackageSelection": result._id,
                "relatedTreatment": req.body.relatedTreatment,
                "relatedAppointment": req.body.relatedAppointment,
                "relatedPatient": req.body.relatedPatient,
                "paymentMethod": "Advanced", //enum: ['by Appointment','Lapsum','Total','Advanced']
                "amount": req.body.paidAmount,
                "relatedBank": req.body.relatedBank,
                "bankType": req.body.bankType,//must be bank acc from accounting accs
                "paymentType": req.body.paymentType, //enum: ['Bank','Cash']
                "relatedCash": req.body.relatedCash, //must be cash acc from accounting accs
                "createdBy": createdBy,
                "relatedBranch": req.body.relatedBranch,
                "remark": req.body.remark,
                "payment": attachID
            }
            let today = new Date().toISOString()
            const latestDocument = await PackageVoucher.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
            if (latestDocument.length === 0) dataTVC = { ...dataTVC, seq: 1, code: "TVC-" + today.split('T')[0].replace(/-/g, '') + "-1" } // if seq is undefined set initial patientID and seq
            if (latestDocument.length > 0) {
                const increment = latestDocument[0].seq + 1
                dataTVC = { ...dataTVC, code: "TVC-" + today.split('T')[0].replace(/-/g, '') + "-" + increment, seq: increment }
            }
            var packageVoucherResult = await PackageVoucher.create(dataTVC)
        }
        const populatedResult = await PackageSelection.find({ _id: result._id }).populate('createdBy relatedAppointments remainingAppointments relatedTransaction relatedPatient relatedTreatmentList').populate({
            path: 'relatedTreatment',
            model: 'Treatments',
            populate: {
                path: 'relatedDoctor',
                model: 'Doctors'
            }
        })
            .populate({
                path: 'relatedAppointments',
                model: 'Appointments',
                populate: {
                    path: 'relatedDoctor',
                    model: 'Doctors'
                }
            })
        const accResult = await Appointment.findOneAndUpdate(
            { _id: req.body.appointment },
            { $addToSet: { relatedPackageSelection: result._id } },
            { new: true },
        )
        if (data.relatedPatient) {
            const patientResult = await Patient.findOneAndUpdate(
                { _id: req.body.relatedPatient },
                { $addToSet: { relatedPackageSelection: result._id } },
                { new: true }
            )
        }
        let response = {
            message: 'Treatment Selection create success',
            success: true,
            data: populatedResult,
            appointmentAutoGenerate: appointmentResult,
            // fTransResult: fTransResult,
            // secTransResult: secTransResult,
            // packageVoucherResult:packageVoucherResult
        }
        if (packageVoucherResult) response.packageVoucherResult = packageVoucherResult
        if (fTransUpdate) response.fTransResult = fTransUpdate
        if (fTransResult) response.secTransResult = secTransResult
        res.status(200).send(response);
    } catch (error) {
        console.log(error)
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updatePackageSelection = async (req, res, next) => {
    try {
        let data = req.body;
        if (data.paidAmount) {
            data = { ...data, leftOverAmount: data.totalAmount - data.paidAmount } // leftOverAmount Calculation
        }
        if (data.paidAmount === 0) data = { ...data, leftOverAmount: data.totalAmount }
        const result = await PackageSelection.findOneAndUpdate(
            { _id: req.body.id },
            data,
            { new: true },
        ).populate('relatedTreatment');
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.treatmentPayment = async (req, res, next) => {
    let data = req.body;
    let createdBy = req.credentials.id;
    let files = req.files;
    try {
        let { paidAmount } = data;
        const packageSelectionQuery = await PackageSelection.find({ _id: req.body.id, isDeleted: false }).populate('relatedTreatment').populate('relatedAppointments');
        const result = await PackageSelection.findOneAndUpdate(
            { _id: req.body.id },
            { $inc: { leftOverAmount: -paidAmount }, paidAmount: paidAmount },
            { new: true },
        ).populate('relatedTreatment');
        if (files.payment) {
            for (const element of files.payment) {
                let imgPath = element.path.split('cherry-k')[1];
                const attachData = {
                    fileName: element.originalname,
                    imgUrl: imgPath,
                    image: imgPath.split('\\')[2]
                };
                const attachResult = await Attachment.create(attachData);
                var attachID = attachResult._id.toString()
            }
        }
        if (result.paymentMethod === 'Credit') { //
            let dataTVC = {
                "relatedBranch": req.body.relatedBranch,
                "relatedPackageSelection": result._id,
                "relatedTreatment": req.body.relatedTreatment,
                "relatedAppointment": req.body.relatedAppointment,
                "relatedPatient": req.body.relatedPatient,
                "paymentMethod": 'by Appointment', //enum: ['by Appointment','Lapsum','Total','Advanced']
                "amount": paidAmount,
                "relatedBank": req.body.relatedBank, //must be bank acc from accounting accs
                "bankType": req.body.bankType,
                "paymentType": req.body.paymentType, //enum: ['Bank','Cash']
                "relatedCash": req.body.relatedCash,
                "createdBy": createdBy, //must be cash acc from accounting accs
                "relatedBranch": req.body.relatedBranch,
                "remark": req.body.remark,
                "payment": attachID

            }
            let today = new Date().toISOString()
            const latestDocument = await PackageVoucher.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
            if (latestDocument.length === 0) dataTVC = { ...dataTVC, seq: 1, code: "TVC-" + today.split('T')[0].replace(/-/g, '') + "-1" } // if seq is undefined set initial patientID and seq
            if (latestDocument.length > 0) {
                const increment = latestDocument[0].seq + 1
                dataTVC = { ...dataTVC, code: "TVC-" + today.split('T')[0].replace(/-/g, '') + "-" + increment, seq: increment }
            }
            var packageVoucherResult = await PackageVoucher.create(dataTVC)
            //transaction
            var fTransResult = await Transaction.create({
                "amount": req.body.paidAmount,
                "relatedBranch": req.body.relatedBranch,
                "date": Date.now(),
                "remark": null,
                "relatedAccounting": result.relatedTreatment.relatedAccount,
                "type": "Credit",
                "createdBy": createdBy,
                "relatedBranch": req.mongoQuery.relatedBranch
            })
            if (result.relatedTreatment.relatedAccount) {
                var amountUpdate = await Accounting.findOneAndUpdate(
                    { _id: result.relatedTreatment.relatedAccount },
                    { $inc: { amount: -req.body.paidAmount } }
                )
            }
            //sec transaction
            var secTransResult = await Transaction.create({
                "amount": req.body.paidAmount,
                "relatedBranch": req.body.relatedBranch,
                "date": Date.now(),
                "remark": null,
                "relatedBank": req.body.relatedBank,
                "relatedCash": req.body.relatedCash,
                "type": "Debit",
                "relatedTransaction": fTransResult._id,
                "createdBy": createdBy,
                "relatedBranch": req.mongoQuery.relatedBranch
            });
            var fTransUpdate = await Transaction.findOneAndUpdate(
                { _id: fTransResult._id },
                {
                    relatedTransaction: secTransResult._id
                },
                { new: true }
            )
            if (req.body.relatedBank) {
                var amountUpdate = await Accounting.findOneAndUpdate(
                    { _id: req.body.relatedBank },
                    { $inc: { amount: req.body.paidAmount } }
                )
            } else if (req.body.relatedCash) {
                var amountUpdate = await Accounting.findOneAndUpdate(
                    { _id: req.body.relatedCash },
                    { $inc: { amount: req.body.paidAmount } }
                )
            }
        } else if (result.paymentMethod === 'Cash Down') { //byAppointment
            // const packageVoucherResult = await PackageVoucher.create(
            //     {
            //         "relatedTreatment": req.body.relatedTreatment,
            //         "relatedAppointment": req.body.relatedAppointment,
            //         "relatedPatient": req.body.relatedPatient,
            //         "paymentMethod": 'by Appointment', //enum: ['by Appointment','Lapsum','Total','Advanced']
            //         "amount": paidAmount,
            //     }
            // )

            var repayRecord = await Repay.create({
                relatedAppointment: req.body.relatedAppointment,
                relatedPackageSelection: req.body.id,
                paidAmount: req.body.paidAmount,
                relatedBranch: req.body.relatedBranch
            })
            var rpRecordPopulated = await Repay.find({ _id: repayRecord._id }).populate('relatedAppointment')
            //transaction
            var fTransResult = await Transaction.create({
                "amount": req.body.paidAmount,
                "date": Date.now(),
                "remark": null,
                "relatedBranch": req.body.relatedBranch,
                "relatedAccounting": "6467379159a9bc811d97f4d2", //Advance received from customer
                "type": "Debit",
                "createdBy": createdBy,
                "relatedBranch": req.mongoQuery.relatedBranch
            })
            //sec transaction
            var secTransResult = await Transaction.create({
                "amount": req.body.paidAmount,
                "date": Date.now(),
                "remark": null,
                "relatedBranch": req.body.relatedBranch,
                "relatedAccounting": result.relatedTreatment.relatedAccount,
                "type": "Credit",
                "relatedTransaction": fTransResult._id,
                "createdBy": createdBy,
                "relatedBranch": req.mongoQuery.relatedBranch
            })
            var fTransUpdate = await Transaction.findOneAndUpdate(
                { _id: fTransResult._id },
                {
                    relatedTransaction: secTransResult._id
                },
                { new: true }
            )
        }
        let response = {
            success: true,
            data: result,
            //appointmentAutoGenerate: appointmentResult,
            fTransResult: fTransUpdate,
            // secTransResult: secTransResult,
            // packageVoucherResult:packageVoucherResult
        }
        if (packageVoucherResult) response.packageVoucherResult = packageVoucherResult;
        if (rpRecordPopulated) response.rpRecordPopulated = rpRecordPopulated
        return res.status(200).send(response);
    } catch (error) {
        console.log(error)
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deletePackageSelection = async (req, res, next) => {
    try {
        const result = await PackageSelection.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
};

exports.activatePackageSelection = async (req, res, next) => {
    try {
        const result = await PackageSelection.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.createTreatmentTransaction = async (req, res) => {
    try {
        //first transaction 
        const fTransaction = new Transaction({
            "amount": req.body.amount,
            "date": req.body.date,
            "relatedBranch": req.body.relatedBranch,
            "remark": req.body.remark,
            "relatedAccounting": req.body.firstAccount,
            "type": "Credit",
            "createdBy": createdBy,
            "relatedBranch": req.mongoQuery.relatedBranch
        })
        const fTransResult = await fTransaction.save()
        const secTransaction = new Transaction(
            {
                "amount": req.body.amount,
                "date": req.body.date,
                "relatedBranch": req.body.relatedBranch,
                "remark": req.body.remark,
                "relatedAccounting": req.body.secondAccount,
                "type": "Debit",
                "relatedTransaction": fTransResult._id,
                "createdBy": createdBy,
                "relatedBranch": req.mongoQuery.relatedBranch
            }
        )
        var fTransUpdate = await Transaction.findOneAndUpdate(
            { _id: fTransResult._id },
            {
                relatedTransaction: secTransResult._id
            },
            { new: true }
        )
        const secTransResult = await secTransaction.save()
        res.status(200).send({
            message: 'MedicineSale Transaction success',
            success: true,
            fTrans: fTransUpdate,
            sTrans: secTransResult
        });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
}

exports.getRelatedPackageSelections = async (req, res) => {
    try {
        let query = req.mongoQuery;
        let { relatedPatient, start, end, relatedAppointments } = req.body
        if (start && end) query.createdAt = { $gte: start, $lte: end }
        if (relatedPatient) query.relatedPatient = relatedPatient
        if (relatedAppointments) query.relatedAppointments = { $in: relatedAppointments }
        const result = await PackageSelection.find(query).populate('createdBy relatedAppointments remainingAppointments relatedTransaction relatedPatient relatedTreatmentList').populate({
            path: 'relatedTreatment',
            model: 'Treatments',
            populate: {
                path: 'relatedDoctor',
                model: 'Doctors'
            }
        })
        if (result.length === 0)
            return res.status(404).json({ error: true, message: 'No Record Found' });
        return res.status(200).send({ success: true, data: result });
    } catch (error) {

        return res.status(500).send({ error: true, message: 'An Error Occured While Fetching Related Treatment Selections' })
    }
};


exports.searchPackageSelections = async (req, res, next) => {
    try {
        let query = req.mongoQuery
        let { search, relatedPatient } = req.body
        if (relatedPatient) query.relatedPatient = relatedPatient
        if (search) query.$text = { $search: search }
        const result = await PackageSelection.find(query).populate('createdBy relatedAppointments remainingAppointments relatedTransaction relatedPatient relatedTreatmentList').populate({
            path: 'relatedTreatment',
            model: 'Treatments',
            populate: {
                path: 'relatedDoctor',
                model: 'Doctors'
            }
        })
        if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' })
        return res.status(200).send({ success: true, data: result })
    } catch (err) {
        return res.status(500).send({ error: true, message: err.message })
    }
}
