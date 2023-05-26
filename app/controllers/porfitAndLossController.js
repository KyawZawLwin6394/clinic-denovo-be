'use strict';
const Log = require('../models/log');
const MedicineSale = require('../models/medicineSale');
const TreatmentVoucher = require('../models/treatmentVoucher');
const Expense = require('../models/expense');

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
        const expenseWeek = await Expense.find({date:{ $gte: startDate, $lte: endDate }, isDeleted:false}).populate('relatedAccounting relatedBankAccount relatedCashAccount')

        res.status(200).send({
            succes: true,
            data: {
                meidicineSaleWeek: meidicineSaleWeek,
                treatmentVoucherWeek: treatmentVoucherWeek,
                expenseWeek: expenseWeek
            }
        })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.getMonth = async (req, res) => {
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
        const expenseWeek = await Expense.find({date:{ $gte: startDate, $lte: endDate }, isDeleted:false}).populate('relatedAccounting relatedBankAccount relatedCashAccount')

        res.status(200).send({
            succes: true,
            data: {
                meidicineSaleWeek: meidicineSaleWeek,
                treatmentVoucherWeek: treatmentVoucherWeek,
                expenseWeek: expenseWeek
            }
        })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

function getLastDayOfMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}