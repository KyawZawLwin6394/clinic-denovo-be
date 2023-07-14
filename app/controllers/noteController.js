'use strict';
const notes = require('../models/notes');
const Note = require('../models/notes');
const Transaction = require('../models/transaction')

exports.listAllNotes = async (req, res) => {
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
        let result = await Note.find(query)
        count = await Note.find(query).count();
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

exports.getNote = async (req, res) => {
    let query = req.mongoQuery
    if (req.params.id) query._id = req.params.id
    const result = await Note.find(query)
    if (result.length === 0)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createNote = async (req, res, next) => {
    let newBody = req.body;
    try {
        const newNote = new Note(newBody);
        const result = await newNote.save();
        res.status(200).send({
            message: 'Note create success',
            success: true,
            data: result
        });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateNote = async (req, res, next) => {
    try {
        const result = await Note.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        )
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteNote = async (req, res, next) => {
    try {
        const result = await Note.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

const getNetAmount = async (id, start, end) => {
    const debit = await Transaction.find({ relatedAccounting: id, type: 'Debit', date: { $gte: start, $lte: end } })
    const totalDebit = debit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);
    const credit = await Transaction.find({ relatedAccounting: id, type: 'Credit', date: { $gte: start, $lte: end } })
    const totalCredit = credit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);
    return totalDebit - totalCredit
}

exports.getNotesByAccounts = async (req, res) => {
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    let { notesID, monthName } = req.query
    let prep = []
    let start = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(monthName), 1));
    let end = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(monthName) + 1, 1));
    try {
        const result = await Note.find({ _id: notesID }).populate('item.relatedAccount')
        // console.log(result[0].item)
        for (const item of result[0].item) {
            const res = await getNetAmount(item.relatedAccount._id, start, end)
            prep.push({ amount: Math.abs(res), operator: item.operator, name: item.relatedAccount.name })
        }
        console.log(prep)
        const total = prep.reduce((accumulator, element) => {
            if (element.operator === 'Plus') {
                accumulator = accumulator + element.amount
            } else if (element.operator === 'Minus') (
                accumulator = accumulator - element.amount
            )
            return accumulator
        }, 0)
        const surgeryNetAmount = await getNetAmount(result[0].relatedSurgery, start, end)
        console.log(total)
        return res.status(200).send({
            success: true,
            data: {
                table: prep,
                total: total,
                notesName: result[0].name,
                surgeryNetAmount: surgeryNetAmount
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: true, message: error.message })
    }
}

exports.activateNote = async (req, res, next) => {
    try {
        const result = await Note.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
