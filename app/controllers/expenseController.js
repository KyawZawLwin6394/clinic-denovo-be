'use strict';
const Expense = require('../models/expense');
const Transaction = require('../models/transaction');
const Accounting = require('../models/accountingList');

exports.listAllExpenses = async (req, res) => {
    let { keyword, role, limit, skip } = req.query;
    let count = 0;
    let page = 0;
    try {
        limit = +limit <= 100 ? +limit : 30; //limit
        skip = +skip || 0;
        let query = { isDeleted: false },
            regexKeyword;
        role ? (query['role'] = role.toUpperCase()) : '';
        keyword && /\w/.test(keyword)
            ? (regexKeyword = new RegExp(keyword, 'i'))
            : '';
        regexKeyword ? (query['name'] = regexKeyword) : '';
        let result = await Expense.find(query).populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount')
        console.log(result)
        count = await Expense.find(query).count();
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

exports.getExpense = async (req, res) => {
    const result = await Expense.find({ _id: req.params.id, isDeleted: false }).populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount')
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createExpense = async (req, res, next) => {
    try {
        const newBody = req.body;
        const newExpense = new Expense(newBody);
        const result = await newExpense.save();
        const populatedResult = await Expense.find({_id:result._id}).populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount')
        const firstTransaction =
        {
            "initialExchangeRate": newBody.initialExchangeRate,
            "amount": newBody.finalAmount,
            "date": newBody.date,
            "remark": newBody.remark,
            "type": "Debit",
            "relatedTreatment": newBody.relatedTreatment,
            "treatmentFlag": false,
            "relatedTransaction": null,
            "relatedAccounting": newBody.relatedAccounting,
            "relatedExpense" : result._id
        }
        const newTrans = new Transaction(firstTransaction)
        const fTransResult = await newTrans.save();
        console.log(fTransResult)
        if (req.body.relatedCredit) {
            //credit
            const secondTransaction = {
                "initialExchangeRate": newBody.initialExchangeRate,
                "amount": newBody.finalAmount,
                "date": newBody.date,
                "remark": newBody.remark,
                "type": "Credit",
                "relatedTreatment": newBody.relatedTreatment,
                "treatmentFlag": false,
                "relatedTransaction": fTransResult._id,
                "relatedAccounting": newBody.relatedAccounting,
                "relatedExpense" : result._id,
                "relatedCredit":newBody.relatedCredit
            }
            const secTrans = new Transaction(secondTransaction)
            var secTransResult = await secTrans.save();
            console.log(secTransResult)
        } else {
            //bank or cash
            
                const secondTransaction = {
                    "initialExchangeRate": newBody.initialExchangeRate,
                    "amount": newBody.finalAmount,
                    "date": newBody.date,
                    "remark": newBody.remark,
                    "type": "Credit",
                    "relatedTreatment": newBody.relatedTreatment,
                    "treatmentFlag": false,
                    "relatedTransaction": fTransResult._id,
                    "relatedAccounting": (newBody.relatedBankAccount) ? newBody.relatedBankAccount : newBody.relatedCashAccount,
                    "relatedExpense" : result._id,
                    "relatedBank": newBody.relatedBankAccount,
                    "relatedCash": newBody.relatedCashAccount
                }
            

            const secTrans = new Transaction(secondTransaction)
            var secTransResult = await secTrans.save();
            console.log(secTransResult)
        }
        res.status(200).send({
            message: 'Expense create success',
            success: true,
            data: populatedResult,
            firstTrans: fTransResult,
            secTrans: secTransResult
        });
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateExpense = async (req, res, next) => {
    try {
        const result = await Expense.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteExpense = async (req, res, next) => {
    try {
        const result = await Expense.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activateExpense = async (req, res, next) => {
    try {
        const result = await Expense.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.expenseFilter = async (req, res) => {
    let query = { relatedBankAccount: { $exists: true }, isDeleted: false }
    try {
        const { start, end, relatedBranch, createdBy } = req.query
        if (start && end) query.date = { $gte: start, $lt: end }
        if (relatedBranch) query.relatedBranch = relatedBranch
        if (createdBy) query.createdBy = createdBy
        const bankResult = await Expense.find(query).populate('relatedBankAccount relatedAccounting relatedCredit relatedCashAccount relatedBranch').populate('createdBy', 'givenName')
        const { relatedBankAccount, ...query2 } = query;
        query2.relatedCashAccount = { $exists: true };
        console.log(query2)
        const cashResult = await Expense.find(query2).populate('relatedBankAccount relatedAccounting relatedCredit relatedCashAccount relatedBranch').populate('createdBy', 'givenName')
        const BankNames = bankResult.reduce((result, { relatedBankAccount, finalAmount }) => {
            const { name } = relatedBankAccount;
            result[name] = (result[name] || 0) + finalAmount;
            return result;
        }, {});
        const CashNames = cashResult.reduce((result, { relatedCashAccount, finalAmount }) => {
            const { name } = relatedCashAccount;
            result[name] = (result[name] || 0) + finalAmount;
            return result;
        }, {});
        const BankTotal = bankResult.reduce((total, sale) => total + sale.finalAmount, 0);
        const CashTotal = cashResult.reduce((total, sale) => total + sale.finalAmount, 0);
        console.log(BankNames)

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
