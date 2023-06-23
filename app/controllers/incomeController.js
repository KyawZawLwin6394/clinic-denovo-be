'use strict';
const Income = require('../models/income');
const Transaction = require('../models/transaction')
const Accounting = require('../models/accountingList');
const MedicineSale = require('../models/medicineSale');
const TreatmentVoucher = require('../models/treatmentVoucher');
const Expense = require('../models/expense');

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
    let result = await Income.find(query).populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount');
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
    const populatedResult = await Income.find({ _id: result._id }).populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount')
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
      "relatedIncome": result._id
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
        "relatedIncome": result._id,
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
        "relatedIncome": result._id,
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

exports.incomeFilter = async (req, res) => {
  let query = { relatedBankAccount: { $exists: true }, isDeleted: false }
  try {
    const { start, end, createdBy } = req.query
    if (start && end) query.date = { $gte: start, $lt: end }
    if (createdBy) query.createdBy = createdBy
    const bankResult = await Income.find(query).populate('relatedAccounting relatedBankAccount relatedCashAccount relatedCredit')
    const { relatedBankAccount, ...query2 } = query;
    query2.relatedCashAccount = { $exists: true };
    const cashResult = await Income.find(query2).populate('relatedAccounting relatedBankAccount relatedCashAccount relatedCredit')
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


exports.totalIncome = async (req, res) => {
  let { exactDate, relatedBranch } = req.query;
  let filterQuery = { relatedBankAccount: { $exists: true } }
  let filterQuery2 = { relatedBank: { $exists: true } }
  const date = new Date(exactDate);
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Set start date to the beginning of the day
  const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);// Set end date to the beginning of the next day
  if (exactDate) {
    filterQuery2.createdAt = { $gte: startDate, $lt: endDate }
    filterQuery.date = { $gte: startDate, $lt: endDate }
  }
  if (relatedBranch) {
    filterQuery2.relatedBranch = relatedBranch
    filterQuery.relatedBranch = relatedBranch
  }
  console.log(filterQuery, filterQuery2)
  const msFilterBankResult = await MedicineSale.find(filterQuery2).populate('relatedPatient relatedAppointment medicineItems.item_id relatedTreatment relatedBank relatedCash').populate({
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
  const tvFilterBankResult = await TreatmentVoucher.find(filterQuery2).populate('relatedTreatment relatedAppointment relatedPatient relatedBank relatedCash')
  const incomeFilterBankResult = await Income.find(filterQuery).populate('relatedAccounting relatedBankAccount relatedCashAccount')
  const expenseFilterBankResult = await Expense.find(filterQuery).populate('relatedAccounting relatedBankAccount relatedCashAccount')

  const { relatedBankAccount, ...filterQuerys } = filterQuery;
  filterQuerys.relatedCashAccount = { $exists: true };

  const { relatedBank, ...filterQuery3 } = filterQuery2;
  filterQuery3.relatedCash = { $exists: true };

  console.log(filterQuerys, filterQuery3)

  const msFilterCashResult = await MedicineSale.find(filterQuery3).populate('relatedPatient relatedAppointment medicineItems.item_id relatedTreatment relatedBank relatedCash').populate({
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
  const tvFilterCashResult = await TreatmentVoucher.find(filterQuery3).populate('relatedTreatment relatedAppointment relatedPatient relatedBank relatedCash')
  const incomeFilterCashResult = await Income.find(filterQuerys).populate('relatedAccounting relatedBankAccount relatedCashAccount')
  const expenseFilterCashResult = await Expense.find(filterQuerys).populate('relatedAccounting relatedBankAccount relatedCashAccount')

  //      Medicine Sale
  const msBankNames = msFilterBankResult.reduce((result, { relatedBank, totalAmount }) => {
    const { name } = relatedBank;
    result[name] = (result[name] || 0) + totalAmount;
    return result;
  }, {});
  const msCashNames = msFilterCashResult.reduce((result, { relatedCash, totalAmount }) => {
    const { name } = relatedCash;
    result[name] = (result[name] || 0) + totalAmount;
    return result;
  }, {});
  const msBankTotal = msFilterBankResult.reduce((total, sale) => total + sale.totalAmount, 0);
  const msCashTotal = msFilterCashResult.reduce((total, sale) => total + sale.totalAmount, 0);

  //TreatmentVoucher
  const tvBankNames = tvFilterBankResult.reduce((result, { relatedBank, amount }) => {
    const { name } = relatedBank;
    result[name] = (result[name] || 0) + amount;
    return result;
  }, {});
  const tvCashNames = tvFilterCashResult.reduce((result, { relatedCash, amount }) => {
    const { name } = relatedCash;
    result[name] = (result[name] || 0) + amount;
    return result;
  }, {});
  const tvBankTotal = tvFilterBankResult.reduce((total, sale) => total + sale.amount, 0);
  const tvCashTotal = tvFilterCashResult.reduce((total, sale) => total + sale.amount, 0);

  //Income
  const incomeBankNames = incomeFilterBankResult.reduce((result, { relatedBankAccount, finalAmount }) => {
    const { name } = relatedBankAccount;
    result[name] = (result[name] || 0) + finalAmount;
    return result;
  }, {});
  const incomeCashNames = incomeFilterCashResult.reduce((result, { relatedCashAccount, finalAmount }) => {
    const { name } = relatedCashAccount;
    result[name] = (result[name] || 0) + finalAmount;
    return result;
  }, {});
  const incomeBankTotal = incomeFilterBankResult.reduce((total, sale) => total + sale.finalAmount, 0);
  const incomeCashTotal = incomeFilterCashResult.reduce((total, sale) => total + sale.finalAmount, 0);

  //Expense
  const expenseBankNames = expenseFilterBankResult.reduce((result, { relatedBankAccount, finalAmount }) => {
    const { name } = relatedBankAccount;
    result[name] = (result[name] || 0) + finalAmount;
    return result;
  }, {});
  const expenseCashNames = expenseFilterCashResult.reduce((result, { relatedCashAccount, finalAmount }) => {
    const { name } = relatedCashAccount;
    result[name] = (result[name] || 0) + finalAmount;
    return result;
  }, {});
  const expenseBankTotal = expenseFilterBankResult.reduce((total, sale) => total + sale.finalAmount, 0);
  const expenseCashTotal = expenseFilterCashResult.reduce((total, sale) => total + sale.finalAmount, 0);
  return res.status(200).send({
    succes: true,
    Income: {
      bankResult: incomeFilterBankResult,
      cashResult: incomeFilterCashResult,
      BankNames: incomeBankNames,
      CashNames: incomeCashNames,
      BankTotal: incomeBankTotal,
      CashTotal: incomeCashTotal
    },
    Expense: {
      bankResult: expenseFilterBankResult,
      cashResult: expenseFilterCashResult,
      BankNames: expenseBankNames,
      CashNames: expenseCashNames,
      BankTotal: expenseBankTotal,
      CashTotal: expenseCashTotal
    },
    MedicineSale: {
      bankResult: msFilterBankResult,
      cashResult: msFilterCashResult,
      BankNames: msBankNames,
      CashNames: msCashNames,
      BankTotal: msBankTotal,
      CashTotal: msCashTotal
    },
    TreatmentVoucher: {
      bankResult: tvFilterBankResult,
      cashResult: tvFilterCashResult,
      BankNames: tvBankNames,
      CashNames: tvCashNames,
      BankTotal: tvBankTotal,
      CashTotal: tvCashTotal
    },
  })
}

exports.getwithExactDate = async (req, res) => {
  try {
    let { date } = req.query
    let result = await Income.find({ date: date }).populate('relatedBranch').populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount');
    if (result.length === 0) return res.status(404).send({ error: true, message: 'Not Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })

  }
}