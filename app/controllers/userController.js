'use strict';
const User = require('../models/user');
exports.createUser = async (req, res) => {
  let data = req.body;
  try {
    data = {...data, isUser:true} // set user role
    const newUser = new User(data);
    let result = await newUser.save();
    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (e) {
    const duplicateKey = Object.keys(e.keyValue)
    if (e.code === 11000)
      return res
        .status(500)
        .send({ error: true, message: `${duplicateKey} is already registered!` });
    return res.status(500).send({ error: true, message: e.message });
  }
};

exports.createDoctor = async (req, res) => {
  let data = req.body;
  try {
    data = {...data, isDoctor:true} // set doctor role
    const newUser = new User(data);
    let result = await newUser.save();
    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (e) {
    const duplicateKey = Object.keys(e.keyValue)
    if (e.code === 11000)
      return res
        .status(500)
        .send({ error: true, message: `${duplicateKey} is already registered!` });
    return res.status(500).send({ error: true, message: e.message });
  }
};

exports.createAdmin = async (req, res) => {
  let data = req.body;
  try {
    data = {...data, isAdmin:true} // set admin role
    const newUser = new User(data);
    let result = await newUser.save();
    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (e) {
    const duplicateKey = Object.keys(e.keyValue)
    if (e.code === 11000)
      return res
        .status(500)
        .send({ error: true, message: `${duplicateKey} is already registered!` });
    return res.status(500).send({ error: true, message: e.message });
  }
};

exports.listAllUsers = async (req, res) => {
  let { keyword, role, limit, skip } = req.query;
  let count = 0;
  let page = 0;
  try {
    limit = +limit <= 100 ? +limit : 10;
    skip = +skip || 0;
    let query = {isDeleted:false},
      regexKeyword;
    role ? (query['role'] = role.toUpperCase()) : '';
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : '';
    regexKeyword ? (query['name'] = regexKeyword) : '';

    let result = await User.find(query).limit(limit).skip(skip);
    count = await User.find(query).count();
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

exports.getUserDetail = async (req, res) => {
  try {
    let result = await User.findById(req.params.id);
    if (!result)
      return res.status(500).json({ error: true, message: 'No record found.' });
    res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};

exports.updateUser = async (req, res, next) => {
  let data = req.body;
  try {

    const {password, ...preparation} = data //removes password field from data
    let result = await User.findByIdAndUpdate(req.body.id, {$set:preparation}, {
      new: true,
    });
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(500)
        .send({ error: true, message: 'This email is already registered!' });
    return res.status(500).send({ error: true, message: error.message });
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const result = await User.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true }
    );
    return res
      .status(200)
      .send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};

exports.activateUser = async (req, res, next) => {
  try {
    const result = await User.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true }
    );
    return res
      .status(200)
      .send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};
