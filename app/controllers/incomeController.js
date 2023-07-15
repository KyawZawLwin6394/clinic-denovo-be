'use strict';
const Income = require('../models/income');
const Transaction = require('../models/transaction')
const Accounting = require('../models/accountingList');
const MedicineSale = require('../models/medicineSale');
const TreatmentVoucher = require('../models/treatmentVoucher');
const Expense = require('../models/expense');
const mergeAndSum = require('../lib/userUtil').mergeAndSum;
const Currency = require('../models/currency');


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
    let result = await Income.find(query).populate('relatedBranch').populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount');
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
  let query = { isDeleted: false }
  if (req.params.id) query._id = req.params.id
  const result = await Income.find(query).populate('relatedBranch').populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createIncome = async (req, res, next) => {
  try {
    let newBody = req.body;
    newBody = { ...newBody, createdBy: req.credentials.id }
    const newIncome = new Income(newBody);
    const result = await newIncome.save();
    const populatedResult = await Income.find({ _id: result._id }).populate('relatedBranch').populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount')
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
      "relatedIncome": result._id,
      "relatedBranch": newBody.relatedBranch
    }
    const newTrans = new Transaction(firstTransaction)
    const fTransResult = await newTrans.save();
    if (newBody.relatedAccounting) {
      var amountUpdate = await Accounting.findOneAndUpdate(
        { _id: newBody.relatedAccounting },
        { $inc: { amount: newBody.finalAmount } }
      )
    }
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
        "relatedBranch": newBody.relatedBranch,
        "relatedCredit": newBody.relatedCredit
      }
      const secTrans = new Transaction(secondTransaction)
      var secTransResult = await secTrans.save();

      var fTransUpdate = await Transaction.findOneAndUpdate(
        { _id: fTransResult._id },
        {
          relatedTransaction: secTransResult._id
        },
        { new: true }
      )
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
        "relatedCash": newBody.relatedCashAccount,
        "relatedBranch": newBody.relatedBranch
      }
      const secTrans = new Transaction(secondTransaction)
      var secTransResult = await secTrans.save();
      var fTransUpdate = await Transaction.findOneAndUpdate(
        { _id: fTransResult._id },
        {
          relatedTransaction: secTransResult._id
        },
        { new: true }
      )
      if (newBody.relatedBankAccount) {
        var amountUpdate = await Accounting.findOneAndUpdate(
          { _id: newBody.relatedBankAccount },
          { $inc: { amount: newBody.finalAmount } }
        )
      } else if (newBody.relatedCash) {
        var amountUpdate = await Accounting.findOneAndUpdate(
          { _id: newBody.relatedCash },
          { $inc: { amount: newBody.finalAmount } }
        )
      }
    }

    console.log(result, fTransResult, secTransResult)
    res.status(200).send({
      message: 'Income create success',
      success: true,
      data: populatedResult,
      firstTrans: fTransUpdate,
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
    ).populate('relatedBranch').populate('relatedAccounting').populate('relatedBankAccount').populate('relatedCashAccount')
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

exports.totalIncome = async (req, res) => {
  let currencyList = await Currency.find({});
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
  //const expenseFilterBankResult = await Expense.find(filterQuery).populate('relatedAccounting relatedBankAccount relatedCashAccount')

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
  //const expenseFilterCashResult = await Expense.find(filterQuerys).populate('relatedAccounting relatedBankAccount relatedCashAccount')

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
  const incomeBankTotal = incomeFilterBankResult.reduce((total, sale) => {
    let cur = currencyList.filter(currency => currency.code === sale.finalCurrency)[0].exchangeRate
    let ans = cur * sale.finalAmount
    return total + ans
  }, 0);
  const incomeCashTotal = incomeFilterCashResult.reduce((total, sale) => {
    let cur = currencyList.filter(currency => currency.code === sale.finalCurrency)[0].exchangeRate
    let ans = cur * sale.finalAmount
    return total + ans
  }, 0);

  const finalResult = await mergeAndSum({
    Income: {
      BankNames: incomeBankNames,
      CashNames: incomeCashNames,
      BankTotal: incomeBankTotal,
      CashTotal: incomeCashTotal
    },
    MedicineSale: {
      BankNames: msBankNames,
      CashNames: msCashNames,
      BankTotal: msBankTotal,
      CashTotal: msCashTotal
    },
    TreatmentVoucher: {
      BankNames: tvBankNames,
      CashNames: tvCashNames,
      BankTotal: tvBankTotal,
      CashTotal: tvCashTotal
    },
  })
  console.log(finalResult)
  return res.status(200).send({ success: true, data: finalResult })
}

// exports.totalIncome = async (req, res) => {
//   try {
//     const { exactDate, relatedBranch } = req.query;
//     const startDate = getStartDate(exactDate);
//     const endDate = getEndDate(exactDate);
//     const currencyList = await Currency.find({});

//     const msFilterBankResult = await getMedicineSaleData({ startDate, endDate, relatedBranch });
//     const tvFilterBankResult = await getTreatmentVoucherData({ startDate, endDate, relatedBranch });
//     const incomeFilterBankResult = await getIncomeData({ startDate, endDate, relatedBranch });

//     const msFilterCashResult = await getMedicineSaleData({ startDate, endDate, relatedBankAccount: true });
//     const tvFilterCashResult = await getTreatmentVoucherData({ startDate, endDate, relatedBankAccount: true });
//     const incomeFilterCashResult = await getIncomeData({ startDate, endDate, relatedBankAccount: true });

//     const finalResult = await mergeAndSum({
//       Income: {
//         BankData: incomeFilterBankResult,
//         CashData: incomeFilterCashResult,
//         currencyList
//       },
//       MedicineSale: {
//         BankData: msFilterBankResult,
//         CashData: msFilterCashResult,
//         currencyList
//       },
//       TreatmentVoucher: {
//         BankData: tvFilterBankResult,
//         CashData: tvFilterCashResult,
//         currencyList
//       },
//     });

//     return res.status(200).send({ success: true, data: finalResult });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({ success: false, error: "An error occurred while calculating total income." });
//   }
// }

// function getStartDate(exactDate) {
//   if (exactDate) {
//     const date = new Date(exactDate);
//     return new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Set start date to the beginning of the day
//   }
//   return null;
// }

// function getEndDate(exactDate) {
//   if (exactDate) {
//     const date = new Date(exactDate);
//     return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1); // Set end date to the beginning of the next day
//   }
//   return null;
// }

// async function getMedicineSaleData({ startDate, endDate, relatedBranch, relatedBankAccount }) {
//   const filterQuery = { relatedBank: { $exists: true } };

//   if (startDate && endDate) {
//     filterQuery.createdAt = { $gte: startDate, $lt: endDate };
//   }

//   if (relatedBranch) {
//     filterQuery.relatedBranch = relatedBranch;
//   }

//   if (relatedBankAccount) {
//     filterQuery.relatedBankAccount = { $exists: true };
//   }

//   return await MedicineSale.find(filterQuery)
//     .populate('relatedPatient relatedAppointment medicineItems.item_id relatedTreatment relatedBank relatedCash')
//     .populate({
//       path: 'relatedTransaction',
//       populate: [{
//         path: 'relatedAccounting',
//         model: 'AccountingLists'
//       }, {
//         path: 'relatedBank',
//         model: 'AccountingLists'
//       }, {
//         path: 'relatedCash',
//         model: 'AccountingLists'
//       }]
//     });
// }

// async function getTreatmentVoucherData({ startDate, endDate, relatedBranch, relatedBankAccount }) {
//   const filterQuery = { relatedBank: { $exists: true } };

//   if (startDate && endDate) {
//     filterQuery.createdAt = { $gte: startDate, $lt: endDate };
//   }

//   if (relatedBranch) {
//     filterQuery.relatedBranch = relatedBranch;
//   }

//   if (relatedBankAccount) {
//     filterQuery.relatedBankAccount = { $exists: true };
//   }

//   return await TreatmentVoucher.find(filterQuery)
//     .populate('relatedTreatment relatedAppointment relatedPatient relatedBank relatedCash');
// }

// async function getIncomeData({ startDate, endDate, relatedBranch, relatedBankAccount }) {
//   const filterQuery = { relatedBankAccount: { $exists: true } };

//   if (startDate && endDate) {
//     filterQuery.date = { $gte: startDate, $lt: endDate };
//   }

//   if (relatedBranch) {
//     filterQuery.relatedBranch = relatedBranch;
//   }

//   if (relatedBankAccount) {
//     filterQuery.relatedBankAccount = { $exists: true };
//   }

//   return await Income.find(filterQuery).populate('relatedAccounting relatedBankAccount relatedCashAccount');
// }

// async function mergeAndSum(data) {
//   const bankNames = {};
//   const cashNames = {};
//   let bankTotal = 0;
//   let cashTotal = 0;

//   for (const [key, value] of Object.entries(data)) {
//     const { BankData, CashData, currencyList } = value;

//     if (BankData) {
//       for (const sale of BankData) {
//         const { relatedBank, totalAmount } = sale;
//         const { name } = relatedBank;
//         bankNames[name] = (bankNames[name] || 0) + totalAmount;
//       }
//     }

//     if (CashData) {
//       for (const sale of CashData) {
//         const { relatedCash, totalAmount } = sale;
//         const { name } = relatedCash;
//         cashNames[name] = (cashNames[name] || 0) + totalAmount;
//       }
//     }

//     bankTotal += BankData ? BankData.reduce((total, sale) => total + sale.totalAmount, 0) : 0;
//     cashTotal += CashData ? CashData.reduce((total, sale) => total + sale.totalAmount, 0) : 0;
//   }

//   const bankTotalConverted = convertCurrency(bankTotal, currencyList);
//   const cashTotalConverted = convertCurrency(cashTotal, currencyList);

//   return {
//     BankNames: bankNames,
//     CashNames: cashNames,
//     BankTotal: bankTotalConverted,
//     CashTotal: cashTotalConverted,
//   };
// }

// function convertCurrency(amount, currencyList) {
//   let convertedAmount = 0;

//   for (const currency of currencyList) {
//     if (currency.code === sale.finalCurrency) {
//       convertedAmount = currency.exchangeRate * amount;
//       break;
//     }
//   }

//   return convertedAmount;
// }


exports.incomeFilter = async (req, res) => {
  let query = { relatedBankAccount: { $exists: true }, isDeleted: false }
  try {
    const currencyList = await Currency.find({})
    const { start, end, relatedBranch, createdBy } = req.query
    if (start && end) query.date = { $gte: start, $lt: end }
    if (relatedBranch) query.relatedBranch = relatedBranch
    if (createdBy) query.createdBy = createdBy
    const bankResult = await Income.find(query).populate('relatedAccounting relatedBankAccount relatedCashAccount relatedCredit relatedBranch')
    const { relatedBankAccount, ...query2 } = query;
    query2.relatedCashAccount = { $exists: true };
    const cashResult = await Income.find(query2).populate('relatedAccounting relatedBankAccount relatedCashAccount relatedCredit relatedBranch')
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
    const BankTotal = bankResult.reduce((total, sale) => {
      let cur = currencyList.filter(currency => currency.code === sale.finalCurrency)[0].exchangeRate
      let ans = cur * sale.finalAmount
      return total + ans
    }, 0);
    const CashTotal = cashResult.reduce((total, sale) => {
      let cur = currencyList.filter(currency => currency.code === sale.finalCurrency)[0].exchangeRate
      let ans = cur * sale.finalAmount
      return total + ans
    }, 0);

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

exports.filterIncome = async (req, res, next) => {
  try {
    let query = { isDeleted: false }
    let { startDate, endDate } = req.query
    if (startDate && endDate) query.createdAt = { $gte: startDate, $lte: endDate }
    if (Object.keys(query).length === 0) return res.status(404).send({ error: true, message: 'Please Specify A Query To Use This Function' })
    const result = await Income.find(query)
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.searchIncome = async (req, res, next) => {
  let query = { relatedBankAccount: { $exists: true }, isDeleted: false }
  try {
    const currencyList = await Currency.find({})
    const { start, end, relatedBranch, createdBy, search } = req.query
    if (start && end) query.date = { $gte: start, $lt: end }
    if (relatedBranch) query.relatedBranch = relatedBranch
    if (createdBy) query.createdBy = createdBy
    if (search) query.$text = { $search: search }
    const bankResult = await Income.find(query).populate('relatedAccounting relatedBankAccount relatedCashAccount relatedCredit relatedBranch')
    const { relatedBankAccount, ...query2 } = query;
    query2.relatedCashAccount = { $exists: true };
    const cashResult = await Income.find(query2).populate('relatedAccounting relatedBankAccount relatedCashAccount relatedCredit relatedBranch')
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
    const BankTotal = bankResult.reduce((total, sale) => {
      let cur = currencyList.filter(currency => currency.code === sale.finalCurrency)[0].exchangeRate
      let ans = cur * sale.finalAmount
      return total + ans
    }, 0);
    const CashTotal = cashResult.reduce((total, sale) => {
      let cur = currencyList.filter(currency => currency.code === sale.finalCurrency)[0].exchangeRate
      let ans = cur * sale.finalAmount
      return total + ans
    }, 0);

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
