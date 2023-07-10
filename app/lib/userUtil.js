const bcrypt = require('bcryptjs');
const AccountBalance = require('../models/accountBalance');
const Accounting = require('../models/accountingList');

async function filterRequestAndResponse(reArr, reBody) {
  if (reArr.length > 0) {
    const result = {};
    reArr.map((req) => {
      result[req] = reBody[req];
    })
    return result;
  }
  return;
}

async function bcryptHash(password) {
  const hashedPassword = await bcrypt.hash(password, 10)
  return hashedPassword
}

async function bcryptCompare(plain, hash) {
  const result = await bcrypt.compare(plain, hash)
  return result
}

async function getLatestDay() {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Get the number of days in the current month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  return currentDay === lastDayOfMonth;
}

async function createAccountBalance() {
  const accountingResult = await Accounting.find({})
  for (const item of accountingResult) {
    //get closing account
    const query = { relatedAccounting: item._id, type: 'Closing' };
    const sort = { _id: -1 }; // Sort by descending _id to get the latest document
    const latestClosingDocument = await AccountBalance.findOne(query, null, { sort });
    if (latestClosingDocument) {
      var result = await AccountBalance.create({
        relatedAccounting: item._id,
        amount: latestClosingDocument.amount,
        type: 'Opening',
        date: Date.now(),
        remark: null,
        relatedBranch: null
      })
    } else {
      var result = await AccountBalance.create({
        relatedAccounting: item._id,
        amount: 0,
        type: 'Opening',
        date: Date.now(),
        remark: null,
        relatedBranch: null
      })
    }
    console.log('Successful', item.name)
  }
}

async function mergeAndSum(data) {
  const BankNames = {};
  const CashNames = {};
  let BankTotal = 0;
  let CashTotal = 0;

  for (const value of Object.values(data)) {
    if (value.BankNames) {
      for (const [bankName, bankValue] of Object.entries(value.BankNames)) {
        BankNames[bankName] = (BankNames[bankName] || 0) + bankValue;
      }
    }

    if (value.CashNames) {
      for (const [cashName, cashValue] of Object.entries(value.CashNames)) {
        CashNames[cashName] = (CashNames[cashName] || 0) + cashValue;
      }
    }

    BankTotal += value.BankTotal || 0;
    CashTotal += value.CashTotal || 0;
  }

  return {
    BankNames,
    CashNames,
    BankTotal,
    CashTotal,
  };
}

module.exports = { bcryptHash, bcryptCompare, filterRequestAndResponse, mergeAndSum, getLatestDay,createAccountBalance };
