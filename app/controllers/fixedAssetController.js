'use strict';
const FixedAsset = require('../models/fixedAsset');
const Transaction = require('../models/transaction');
const Accounting = require('../models/accountingList');

exports.listAllFixedAssets = async (req, res) => {
  let { keyword, role, limit, skip } = req.query;
  let count = 0;
  let page = 0;
  try {
    limit = +limit <= 100 ? +limit : 20; //limit
    skip = +skip || 0;
    let query = { isDeleted: false },
      regexKeyword;
    role ? (query['role'] = role.toUpperCase()) : '';
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : '';
    regexKeyword ? (query['name'] = regexKeyword) : '';
    let result = await FixedAsset.find(query).populate('relatedAccount');
    console.log(result)
    count = await FixedAsset.find(query).count();
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

exports.getFixedAsset = async (req, res) => {
  const result = await FixedAsset.find({ _id: req.params.id, isDeleted: false }).populate('relatedAccount')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createFixedAsset = async (req, res, next) => {
  try {
    const data = req.body;
    const { initialPrice, depriciationTotal, depriciationAcc, fixedAssetAcc } = req.body;
    const newBody = req.body;
    const newFixedAsset = new FixedAsset(newBody);
    const result = await newFixedAsset.save().then(async response => {
      if (fixedAssetAcc) {
        var transResult = await Transaction.create({
          "amount": initialPrice,
          "date": Date.now(),
          "remark": data.remark,
          "type": "Debit",
          "relatedTransaction": null,
          "relatedAccounting": fixedAssetAcc,
        })
        const transResultAmtUpdate = await Accounting.findOneAndUpdate(
          { _id: fixedAssetAcc },
          { $inc: { amount: initialPrice } }
        )
      }
      if (depriciationAcc) {
        var transResult = await Transaction.create({
          "amount": depriciationTotal,
          "date": Date.now(),
          "remark": data.remark,
          "type": "Debit",
          "relatedTransaction": null,
          "relatedAccounting": depriciationAcc,
        })
        const transResultUpdate = await Accounting.findOneAndUpdate(
          { _id: depriciationAcc },
          { $inc: { amount: depriciationTotal } }
        )
      }

      // const SectransResult = await Transaction.create({
      //   "amount": data.totalPrice,
      //   "date": Date.now(),
      //   "remark": data.remark,
      //   "type": "Credit",
      //   "relatedTransaction": null,
      //   "relatedBank": req.body.relatedBank, //Bank or cashk
      //   "relatedCash": req.body.relatedCash,
      //   "relatedTransaction": transResult._id
      // })
      // var fTransUpdate = await Transaction.findOneAndUpdate(
      //   { _id: transResult._id },
      //   {
      //     relatedTransaction: SectransResult._id
      //   },
      //   { new: true }
      // )
      // if (req.body.relatedBank) {
      //   var amountUpdate = await Accounting.findOneAndUpdate(
      //     { _id: req.body.relatedBank },
      //     { $inc: { amount: req.body.totalPrice } }
      //   )
      // } else if (req.body.relatedCash) {
      //   var amountUpdate = await Accounting.findOneAndUpdate(
      //     { _id: req.body.relatedCash },
      //     { $inc: { amount: req.body.totalPrice } }
      //   )
      // }
    })
    res.status(200).send({
      message: 'FixedAsset create success',
      success: true,
      data: result
    });
  } catch (error) {
    console.log(error)
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateFixedAsset = async (req, res, next) => {
  try {
    const result = await FixedAsset.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedAccount');
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteFixedAsset = async (req, res, next) => {
  try {
    const result = await FixedAsset.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateFixedAsset = async (req, res, next) => {
  try {
    const result = await FixedAsset.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
