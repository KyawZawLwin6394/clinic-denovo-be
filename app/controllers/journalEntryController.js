// relatedCreditAccount:id (credit)
// relatedDebitAccount:id (debit)'use strict';
const Transaction = require('../models/transaction')
exports.getAllJournals = async (req, res) => {
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
        let result = await Transaction.find(query).populate('relatedAccounting')
        count = await Transaction.find(query).count();
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

exports.getJournal = async (req, res) => {
    try {
        const result = await Transaction.find({ _id: req.params.id, isDeleted: false, JEFlag:true }).populate('relatedAccounting');
        if (!result)
            return res.status(500).json({ error: true, message: 'No Record Found' });
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.createJournal = async (req, res, next) => {
    console.log('journal')
    let { remark, fromAcc, toAcc, amount, date, fromAccType, toAccType } = req.body;
    try {
        const creditTrans = await Transaction.create({
            relatedAccounting: fromAcc,
            amount: amount,
            date: date,
            remark: remark,
            type: fromAccType,
            JEFlag:true
        })

        const debitTrans = await Transaction.create({
            relatedAccounting: toAcc,
            amount: amount,
            date: date,
            remark: remark,
            type: toAccType,
            JEFlag:true
        })

        res.status(200).send({
            message: 'Journal create success',
            success: true,
            creditTrans: creditTrans,
            debitTrans: debitTrans
        });
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
};
