'use strict';
const FixedAsset = require('../models/fixedAsset');

exports.listAllFixedAssets = async (req, res) => {
  let { keyword, role, limit, skip } = req.query;
  let count = 0;
  let page = 0;
  try {
    limit = +limit <= 100 ? +limit : 20; //limit
    skip = +skip || 0;
    let query = {isDeleted:false},
      regexKeyword;
    role ? (query['role'] = role.toUpperCase()) : '';
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : '';
    regexKeyword ? (query['name'] = regexKeyword) : '';
    let result = await FixedAsset.find(query).limit(limit).skip(skip).populate('relatedAccounting');
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
  const result = await FixedAsset.find({ _id: req.params.id,isDeleted:false }).populate('relatedAccounting')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createFixedAsset = async (req, res, next) => {
  try {
    const newBody = req.body;
    const newFixedAsset = new FixedAsset(newBody);
    const result = await newFixedAsset.save();
    res.status(200).send({
      message: 'FixedAsset create success',
      success: true,
      data: result
    });
  } catch (error) {
    console.log(error )
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateFixedAsset = async (req, res, next) => {
  try {
    const result = await FixedAsset.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedAccounting');
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
