'use strict';
const Log = require('../models/log');
const MedicineSale = require('../models/medicineSale');
const TreatmentVoucher = require('../models/treatmentVoucher');
const Expense = require('../models/expense');

exports.getTotal = async (req, res) => {
    try {
        const MSTotal = await MedicineSale.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$totalAmount' // Replace 'amount' with the desired field name
                    }
                }
            }
        ])
        const TVTotal = await TreatmentVoucher.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$amount' // Replace 'amount' with the desired field name
                    }
                }
            }
        ])

        const expenseTotal = await Expense.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$finalAmount' // Replace 'amount' with the desired field name
                    }
                }
            }
        ])
        return res.status(200).send({
            success: true,
            data: {
                MSTotal: MSTotal[0].totalAmount,
                TVTotal: TVTotal[0].totalAmount,
                expenseTotal: expenseTotal[0].totalAmount,
                profit: (MSTotal[0].totalAmount + TVTotal[0].totalAmount) - expenseTotal[0].totalAmount
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: true, message: 'Internal Server Error!' })
    }
}

exports.listAllLog = async (req, res) => {
    try {
        let result = await Log.find({ isDeleted: false }).populate('relatedTreatmentSelection relatedAppointment relatedProcedureItems relatedAccessoryItems relatedMachine').populate({
            path: 'relatedTreatmentSelection',
            populate: [{
                path: 'relatedTreatment',
                model: 'Treatments'
            }]
        });
        let count = await Log.find({ isDeleted: false }).count();
        if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' });
        res.status(200).send({
            success: true,
            count: count,
            data: result
        });
    } catch (error) {
        return res.status(500).send({ error: true, message: 'No Record Found!' });
    }
};

exports.getDay = async (req, res) => {
    console.log('day')
    let { startDate, endDate } = req.body
    try {
        let query = { isDeleted: false }
        if (startDate && endDate) query.createdAt = { $gte: startDate, $lte: endDate }
        const meidicineSaleWeek = await MedicineSale.find(query).populate('relatedPatient relatedAppointment medicineItems.item_id relatedTreatment').populate({
            path: 'relatedTransaction',
            populate: [{
                path: 'relatedAccounting',
                model: 'AccountingLists'
            }, {
                path: 'relatedBank',
                model: 'AccountingLists'
            }, {
                path: 'relatedCash',
                model: 'AccountingLists'
            }]
        });
        const treatmentVoucherWeek = await TreatmentVoucher.find(query).populate('relatedTreatment relatedAppointment relatedPatient')
        const expenseWeek = await Expense.find({ date: { $gte: startDate, $lte: endDate }, isDeleted: false }).populate('relatedAccounting relatedBankAccount relatedCashAccount')
        res.status(200).send({
            succes: true,
            data: {
                meidicineSaleWeek: meidicineSaleWeek,
                treatmentVoucherWeek: treatmentVoucherWeek,
                expenseWeek: expenseWeek
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: true, message: 'Internal Server Error!' });
    }
}

exports.getMonth = async (req, res) => {
    try {
        const { month } = req.body;
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        // Check if the provided month value is valid
        if (!months.includes(month)) {
            return res.status(400).json({ error: 'Invalid month' });
        }

        // Get the start and end dates for the specified month
        const startDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(month), 1));
        const endDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(month) + 1, 1));

        let query = { isDeleted: false }
        if (month) query.createdAt = { $gte: startDate, $lte: endDate }

        const meidicineSaleWeek = await MedicineSale.find(query).populate('relatedPatient relatedAppointment medicineItems.item_id relatedTreatment').populate({
            path: 'relatedTransaction',
            populate: [{
                path: 'relatedAccounting',
                model: 'AccountingLists'
            }, {
                path: 'relatedBank',
                model: 'AccountingLists'
            }, {
                path: 'relatedCash',
                model: 'AccountingLists'
            }]
        });
        const treatmentVoucherWeek = await TreatmentVoucher.find(query).populate('relatedTreatment relatedAppointment relatedPatient')
        const expenseWeek = await Expense.find({ date: { $gte: startDate, $lte: endDate }, isDeleted: false }).populate('relatedAccounting relatedBankAccount relatedCashAccount')
        res.status(200).send({
            succes: true,
            data: {
                meidicineSaleWeek: meidicineSaleWeek,
                treatmentVoucherWeek: treatmentVoucherWeek,
                expenseWeek: expenseWeek
            }
        })
    } catch (error) {
        res.status(500).json({ error: true, message: 'Internal Server Error!' });
    }
}

exports.getWeek = async (req, res) => {
    // Get the current month and year
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    let startDate, endDate;
    let { weekName, monthName } = req.body;
    // Determine the start and end dates based on the weekName
    switch (weekName) {
        case 'First Week':
            startDate = new Date(year, month, 1);
            endDate = new Date(year, month, 7);
            break;
        case 'Second Week':
            startDate = new Date(year, month, 8);
            endDate = new Date(year, month, 14);
            break;
        case 'Third Week':
            startDate = new Date(year, month, 15);
            endDate = new Date(year, month, 21);
            break;
        case 'Fourth Week':
            startDate = new Date(year, month, 22);
            endDate = new Date(year, month, getLastDayOfMonth(year, month));
            break;
        default:
            res.status(400).json({ error: 'Invalid week name' });
            return;
    }

    try {
        //preparing query
        let query = { isDeleted: false }
        if (weekName) query.createdAt = { $gte: startDate, $lte: endDate }

        const meidicineSaleWeek = await MedicineSale.find(query).populate('relatedPatient relatedAppointment medicineItems.item_id relatedTreatment').populate({
            path: 'relatedTransaction',
            populate: [{
                path: 'relatedAccounting',
                model: 'AccountingLists'
            }, {
                path: 'relatedBank',
                model: 'AccountingLists'
            }, {
                path: 'relatedCash',
                model: 'AccountingLists'
            }]
        });
        const treatmentVoucherWeek = await TreatmentVoucher.find(query).populate('relatedTreatment relatedAppointment relatedPatient')
        const expenseWeek = await Expense.find({ date: { $gte: startDate, $lte: endDate }, isDeleted: false }).populate('relatedAccounting relatedBankAccount relatedCashAccount')

        res.status(200).send({
            succes: true,
            data: {
                meidicineSaleWeek: meidicineSaleWeek,
                treatmentVoucherWeek: treatmentVoucherWeek,
                expenseWeek: expenseWeek
            }
        })
    } catch (error) {
        res.status(500).json({ error: true, message: 'Internal Server Error!' });
    }
}

function getLastDayOfMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}