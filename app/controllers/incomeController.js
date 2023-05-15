'use strict';
const Income = require('../models/income');
const Transaction = require('../models/transaction')
const Bank = require('../models/bank');
exports.listAllIncomes = async (req, res) => {
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
    let result = await Income.find(query).limit(limit).skip(skip).populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount');
    console.log(result)
    count = await Income.find(query).count();
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

exports.getIncome = async (req, res) => {
  const result = await Income.find({ _id: req.params.id, isDeleted: false }).populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createIncome = async (req, res, next) => {
  try {
    const newBody = req.body;
    const newIncome = new Income(newBody);
    const result = await newIncome.save();
    const populatedResult = await Income.find({_id:result._id}).populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount')
    // const bankResult = await Bank.findOneAndUpdate(
    //   { _id: req.body.id },
    //   { $inc: { balance: 50 } },
    //   { new: true },
    // ).populate('relatedAccounting');
    const firstTransaction =
    {
      "initialExchangeRate": newBody.initialExchangeRate,
      "amount": newBody.finalAmount,
      "date": newBody.date,
      "remark": newBody.remark,
      "type": "Credit",
      "relatedTreatment": newBody.relatedTreatment,
      "treatmentFlag": false,
      "relatedTransaction": null,
      "relatedAccounting": newBody.relatedAccounting,
      "relatedIncome" : result._id
    }
    const newTrans = new Transaction(firstTransaction)
    const fTransResult = await newTrans.save();
    if (req.body.relatedCredit) {
      //credit
      const secondTransaction = {
        "initialExchangeRate": newBody.initialExchangeRate,
        "amount": newBody.finalAmount,
        "date": newBody.date,
        "remark": newBody.remark,
        "type": "Debit",
        "relatedTreatment": newBody.relatedTreatment,
        "treatmentFlag": false,
        "relatedTransaction": fTransResult._id,
        "relatedAccounting": newBody.relatedAccounting,
        "relatedIncome" : result._id,
        "relatedCredit": newBody.relatedCredit
      }
      const secTrans = new Transaction(secondTransaction)
      var secTransResult = await secTrans.save();
      
    } else {
      //bank or cash
      const secondTransaction = {
        "initialExchangeRate": newBody.initialExchangeRate,
        "amount": newBody.finalAmount,
        "date": newBody.date,
        "remark": newBody.remark,
        "type": "Debit",
        "relatedTreatment": newBody.relatedTreatment,
        "treatmentFlag": false,
        "relatedTransaction": fTransResult._id,
        "relatedAccounting": (newBody.relatedBankAccount) ? newBody.relatedBankAccount : newBody.relatedCashAccount,
        "relatedIncome" : result._id,
        "relatedBank": newBody.relatedBankAccount,
        "relatedCash": newBody.relatedCashAccount
      }
      const secTrans = new Transaction(secondTransaction)
      var secTransResult = await secTrans.save();
    }
    
    console.log(result, fTransResult, secTransResult)
    res.status(200).send({
      message: 'Income create success',
      success: true,
      data: populatedResult,
      firstTrans: fTransResult,
      secTrans: secTransResult
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateIncome = async (req, res, next) => {
  try {
    const result = await Income.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount')
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteIncome = async (req, res, next) => {
  try {
    const result = await Income.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateIncome = async (req, res, next) => {
  try {
    const result = await Income.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
