'use strict';
const Log = require('../models/log');
const ProcedureItem = require('../models/procedureItem');
const AccessoryItem = require('../models/accessoryItem');
const Machine = require('../models/fixedAsset');
const Usage = require('../models/usage');

exports.listAllLog = async (req, res) => {
  try {
    let result = await Log.find({ isDeleted: false }).populate('relatedTreatmentSelection relatedAppointment relatedProcedureItems relatedAccessoryItems relatedMachine').populate({
      path: 'relatedTreatmentSelection',
      populate: [{
        path: 'relatedTreatment',
        model: 'Treatments'
      }]
    });
    let count = await Log.find({ isDeleted: false }).count();
    if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' });
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: 'No Record Found!' });
  }
};

exports.getRelatedUsage = async (req, res) => {
  try {
    let result = await Log.find({ isDeleted: false }).populate('relatedTreatmentSelection relatedAppointment');
    let count = await Log.find({ isDeleted: false }).count();
    if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' });
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: 'No Record Found!' });
  }
};

exports.filterLogs = async (req, res, next) => {
  try {
    let query = { isDeleted: false }
    const { start, end, id } = req.query
    console.log(start, end)
    if (start && end) query.date = { $gte: start, $lte: end }
    if (id) {
      query.$or = []
      query.$or.push(...[{ relatedProcedureItems: id }, { relatedAccessoryItems: id }, { relatedMachine: id }])
    }
    console.log(query)
    if (Object.keys(query).length === 0) return res.status(404).send({ error: true, message: 'Please Specify A Query To Use This Function' })
    const result = await Log.find(query).populate('relatedTreatmentSelection relatedAppointment relatedProcedureItems relatedAccessoryItems relatedMachine');
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.createUsage = async (req, res) => {
  let { relatedTreatmentSelection, relatedAppointment, procedureMedicine, procedureAccessory, machine } = req.body;
  let machineError = []
  let procedureItemsError = []
  let accessoryItemsError = []
  try {

    //procedureMedicine

    if (procedureMedicine !== undefined) {
      procedureMedicine.map(async (e, i) => {
        if (e.stock < e.actual) {
          procedureItemsError.push(e)
        } else {
          let min = e.stock - e.actual
          const result = await ProcedureItem.findOneAndUpdate(
            { _id: e.item_id },
            { currentQuantity: min },
            { new: true },
          )
          const logResult = await Log.create({
            "relatedTreatmentSelection": relatedTreatmentSelection,
            "relatedAppointment": relatedAppointment,
            "relatedProcedureItems": e.item_id,
            "currentQty": e.stock,
            "actualQty": e.actual,
            "finalQty": min
          })
          console.log(logResult)
        }
      })
    }

    //procedureAccessory

    if (procedureAccessory !== undefined) {
      procedureAccessory.map(async (e, i) => {
        if (e.stock < e.actual) {
          accessoryItemsError.push(e)
        } else {
          let min = e.stock - e.actual
          const result = await AccessoryItem.findOneAndUpdate(
            { _id: e.item_id },
            { currentQuantity: min },
            { new: true },
          )
          const logResult = await Log.create({
            "relatedTreatmentSelection": relatedTreatmentSelection,
            "relatedAppointment": relatedAppointment,
            "relatedAccessoryItems": e.item_id,
            "currentQty": e.stock,
            "actualQty": e.actual,
            "finalQty": min
          })
        }
      })
    }

    //machine

    if (machine !== undefined) {
      machine.map(async (e, i) => {
        if (e.stock < e.actual) {
          machineError.push(e)
        } else {
          let min = e.stock - e.actual
          const result = await Machine.findOneAndUpdate(
            { _id: e.item_id },
            { currentQuantity: min },
            { new: true },
          )
          const logResult = await Log.create({
            "relatedTreatmentSelection": relatedTreatmentSelection,
            "relatedAppointment": relatedAppointment,
            "relatedMachine": e.item_id,
            "currentQty": e.stock,
            "actualQty": e.actual,
            "finalQty": min
          })
        }
      })
    }

    //usage create
    let usageResult = await Usage.create(req.body);
    //error handling
    let response = { success: true }
    if (machineError.length > 0) response.machineError = machineError
    if (procedureItemsError.length > 0) response.procedureItemsError = procedureItemsError
    if (machineError.length > 0) response.machineError = machineError
    if (usageResult !== undefined) response.usageResult = usageResult

    return res.status(200).send(response)
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: true, message: error.message })
  }
}