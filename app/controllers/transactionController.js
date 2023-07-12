'use strict';
const Transaction = require('../models/transaction');
const AccountingList = require('../models/accountingList');

exports.listAllTransactions = async (req, res) => {
  let { keyword, role, limit, skip } = req.query;
  let count = 0;
  let page = 0;
  try {
    limit = +limit <= 100 ? +limit : 10; //limit
    skip = +skip || 0;
    let query = { isDeleted: false },
      regexKeyword;
    role ? (query['role'] = role.toUpperCase()) : '';
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : '';
    regexKeyword ? (query['name'] = regexKeyword) : '';
    let result = await Transaction.find(query).populate('relatedAccounting').populate('relatedTreatment').populate('relatedTransaction').populate('relatedBank').populate('relatedCash');
    console.log(result)
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

exports.getTransaction = async (req, res) => {
  const result = await Transaction.find({ _id: req.params.id, isDeleted: false }).populate('relatedAccounting').populate('relatedTreatment').populate('relatedTransaction').populate('relatedBank').populate('relatedCash');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.getRelatedTransaction = async (req, res) => {
  const result = await Transaction.find({ relatedAccounting: req.params.id, isDeleted: false }).populate('relatedAccounting').populate('relatedTreatment').populate('relatedTransaction').populate('relatedBank').populate('relatedCash');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createTransaction = async (req, res, next) => {
  try {
    const newBody = req.body;
    const newTransaction = new Transaction(newBody);
    const result = await newTransaction.save();
    res.status(200).send({
      message: 'Transaction create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const result = await Transaction.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedAccounting').populate('relatedTreatment').populate('relatedTransaction').populate('relatedBank').populate('relatedCash');
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const result = await Transaction.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateTransaction = async (req, res, next) => {
  try {
    const result = await Transaction.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.trialBalanceWithID = async (req, res) => {
  try {
    const result = await Transaction.find({ relatedAccounting: req.params.relatedAccounting, type: 'Debit' }).populate('relatedAccounting relatedTreatment relatedBank relatedCash relatedTransaction relatedMedicineSale');
    if (result.length === 0) return res.status(500).send({ error: true, message: 'Data Not Found!' })
    return res.status(200).send({ success: true, debit: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }

}

const getNetAmount = async (id, start, end) => {
  const debit = await Transaction.find({ relatedAccounting: id, type: 'Debit', date: { $gte: start, $lte: end } })
  const totalDebit = debit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);
  const credit = await Transaction.find({ relatedAccounting: id, type: 'Credit', date: { $gte: start, $lte: end } })
  const totalCredit = credit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);
  return totalDebit - totalCredit
}

exports.incomeStatement = async (req, res) => {
  let [sales, costOfSales, grossProfit] = [[], [], []];

  let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  for (const monthName of months) {
    //Sales-> Clinic and Surgery
    let startDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(monthName), 1));
    let endDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(monthName) + 1, 1));
    const surgeryNetAmount = await getNetAmount('648096bd7d7e4357442aa476', startDate, endDate) //Sales Surgery ID
    let clinicNetAmount = await getNetAmount('649416b44236f7602ba3411a', startDate, endDate) // Sales Clinic ID
    const salesConsignmentNetAmount = await getNetAmount('648096777d7e4357442aa470', startDate, endDate)// Sales Consignement ID
    const salesReturnNetAmount = await getNetAmount('64ae1d3812b3d31436d48033', startDate, endDate)// Sales Return ID 
    const salesComissionNetAmount = await getNetAmount('64ae1d0012b3d31436d48027', startDate, endDate)// Sales Comission ID 
    clinicNetAmount = (clinicNetAmount + salesConsignmentNetAmount) - (salesReturnNetAmount + salesComissionNetAmount)
    sales.push({ surgery: surgeryNetAmount, clinic: clinicNetAmount, month: monthName })
    //Sales-> End of Clinic and Surgery

    //COGS
    const surgeryCOGSNetAmount = await getNetAmount('64a8e0bb55a87deaea39e187', startDate, endDate)  //Surgery COGS
    const clinicCOGSNetAmount = await getNetAmount('64a8e0e755a87deaea39e18d', startDate, endDate)   //Clinic Treatement COGS
    costOfSales.push({ surgery: surgeryCOGSNetAmount, clinic: clinicCOGSNetAmount, month: monthName })
    //End of COGS

    grossProfit.push({ surgery: surgeryCOGSNetAmount - Math.abs(surgeryNetAmount), clinic: clinicCOGSNetAmount - Math.abs(clinicNetAmount), month: monthName })

  }

  return res.status(200).send({
    success: true, data: {
      Sales: sales,
      CostOfSales: costOfSales,
      GrossProfit: grossProfit
    }
  })

}

exports.trialBalance = async (req, res) => {
  let finalResult = []
  let transaction = []
  let { start, end } = req.query
  try {
    const allAccounts = await AccountingList.find({}).populate('relatedType relatedHeader relatedTreatment relatedBank relatedBranch')
    for (let i = 0; i < allAccounts.length; i++) {
      const id = allAccounts[i]._id
      let netType = '';
      let netAmount = 0;
      console.log(id)
      const debit = await Transaction.find({ relatedAccounting: id, type: 'Debit', date: { $gte: start, $lte: end } })
      for (let d = 0; d < debit.length; d++) {
        transaction.push({ relatedAccounting: debit[d].relatedAccounting, type: "Debit", date: debit[d].date, amount: debit[d].amount, remark: debit[d].remark })
      }
      // if (debit.length === 0) return res.status(500).send({error:true, message:'Debit Data Not Found!'})
      const totalDebit = debit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);

      const credit = await Transaction.find({ relatedAccounting: id, type: 'Credit', date: { $gte: start, $lte: end } })
      for (let c = 0; c < credit.length; c++) {
        transaction.push({ relatedAccounting: credit[c].relatedAccounting, type: "Debit", date: credit[c].date, amount: credit[c].amount, remark: credit[c].remark })
      }
      // if (credit.length === 0) return res.status(500).send({error:true, message:'Credit Data Not Found!'})
      const totalCredit = credit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);

      if (totalDebit === totalDebit) {
        netType = null
        netAmount = 0
      }
      netAmount = totalDebit - totalCredit
      if (netAmount > 0) netType = 'Debit'
      if (netAmount < 0) netType = 'Credit'
      finalResult.push({ totalCredit: totalCredit, totalDebit: totalDebit, netType: netType, netAmount: netAmount, accName: allAccounts[i].name, type: allAccounts[i].relatedType, relatedAccountingId: allAccounts[i]._id, header: allAccounts[i].relatedHeader ? allAccounts[i].relatedHeader.name : undefined, subHeader: allAccounts[i].subHeader })
    }
    if (allAccounts.length === finalResult.length) return res.status(200).send({ success: true, data: finalResult, transaction: transaction })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.trialBalanceWithType = async (req, res) => {
  let finalResult = []
  let { start, end, type } = req.query
  try {
    const allAccounts = await AccountingList.find({ relatedType: type }).populate('relatedType')
    for (let i = 0; i < allAccounts.length; i++) {
      const id = allAccounts[i]._id
      let netType = '';
      let netAmount = 0;
      const debit = await Transaction.find({ relatedAccounting: id, type: 'Debit', date: { $gte: start, $lte: end } })
      // if (debit.length === 0) return res.status(500).send({error:true, message:'Debit Data Not Found!'})
      const totalDebit = debit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);

      const credit = await Transaction.find({ relatedAccounting: id, type: 'Credit', date: { $gte: start, $lte: end } })
      // if (credit.length === 0) return res.status(500).send({error:true, message:'Credit Data Not Found!'})
      const totalCredit = credit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);

      if (totalDebit === totalDebit) {
        netType = null
        netAmount = 0
      }
      netAmount = totalDebit - totalCredit
      if (netAmount > 0) netType = 'Debit'
      if (netAmount < 0) netType = 'Credit'
      finalResult.push({ totalCredit: totalCredit, totalDebit: totalDebit, netType: netType, netAmount: netAmount, accName: allAccounts[i].name, type: allAccounts[i].relatedType })
    }
    if (allAccounts.length === finalResult.length) return res.status(200).send({ success: true, data: finalResult })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}
