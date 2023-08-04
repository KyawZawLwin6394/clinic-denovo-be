'use strict';
const Log = require('../models/log');
const ProcedureItem = require('../models/procedureItem');
const AccessoryItem = require('../models/accessoryItem');
const Machine = require('../models/fixedAsset');
const Usage = require('../models/usage');
const Stock = require('../models/stock')
const UsageRecords = require('../models/usageRecord');
const Appointment = require('../models/appointment')

exports.listAllLog = async (req, res) => {
  try {
    let result = await Log.find({ isDeleted: false }).populate('createdBy relatedTreatmentSelection relatedAppointment relatedProcedureItems relatedBranch relatedAccessoryItems relatedMachine').populate({
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
    let result = await Log.find({ isDeleted: false }).populate('createdBy relatedTreatmentSelection relatedAppointment');
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
    if (start && end) query.date = { $gte: start, $lte: end }
    if (id) {
      query.$or = []
      query.$or.push(...[{ relatedProcedureItems: id }, { relatedAccessoryItems: id }, { relatedMachine: id }])
    }
    if (Object.keys(query).length === 0) return res.status(404).send({ error: true, message: 'Please Specify A Query To Use This Function' })
    const result = await Log.find(query).populate('createdBy relatedTreatmentSelection relatedAppointment relatedProcedureItems relatedAccessoryItems relatedMachine');
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

// exports.createUsage = async (req, res) => {
//   const { relatedTreatmentSelection, relatedAppointment, procedureMedicine, procedureAccessory, machine } = req.body;
//   const { relatedBranch } = req.mongoQuery;
//   const machineError = [];
//   const procedureItemsError = [];
//   const accessoryItemsError = [];

//   try {
//     const processItems = async (items, Model, relatedField) => {
//       for (const item of items) {
//         if (item.stock < item.actual) {
//           procedureItemsError.push(item);
//         } else {
//           const min = item.stock - item.actual;
//           try {
//             await Model.findOneAndUpdate(
//               { _id: item.item_id, ...(relatedBranch && { relatedBranch }) },
//               { totalUnit: min },
//               { new: true }
//             );
//             await Log.create({
//               relatedTreatmentSelection,
//               relatedAppointment,
//               [relatedField]: item.item_id,
//               currentQty: item.stock,
//               actualQty: item.actual,
//               finalQty: min,
//               ...(relatedBranch && { relatedBranch })
//             });
//           } catch (error) {
//             procedureItemsError.push(item);
//           }
//         }
//       }
//     };

//     if (relatedBranch === undefined) {
//       if (procedureMedicine) {
//         await processItems(procedureMedicine, Stock, "relatedProcedureItems");
//       }

//       if (procedureAccessory) {
//         await processItems(procedureAccessory, AccessoryItem, "relatedAccessoryItems");
//       }

//       if (machine) {
//         await processItems(machine, Machine, "relatedMachine");
//       }
//     } else if (relatedBranch) {
//       if (procedureMedicine) {
//         await processItems(procedureMedicine, Stock, "relatedProcedureItems");
//       }

//       if (procedureAccessory) {
//         await processItems(procedureAccessory, Stock, "relatedAccessoryItems");
//       }

//       if (machine) {
//         await processItems(machine, Stock, "relatedMachine");
//       }
//     }

//     const usageResult = await Usage.create(req.body);
//     const response = { success: true };

//     if (machineError.length > 0) {
//       response.machineError = machineError;
//     }

//     if (procedureItemsError.length > 0) {
//       response.procedureItemsError = procedureItemsError;
//     }

//     if (accessoryItemsError.length > 0) {
//       response.accessoryItemsError = accessoryItemsError;
//     }

//     if (usageResult) {
//       response.usageResult = usageResult;
//     }

//     return res.status(200).send(response);
//   } catch (error) {
//     return res.status(500).send({ error: true, message: error.message });
//   }
// };

exports.getStockTotalUnit = async (req, res) => {
  try {
    let accessoryResults = [];
    let data = req.body;
    if (data.procedureItems) var procedureItems = await Stock.find({ relatedProcedureItems: { $in: data.procedureItems }, relatedBranch: data.relatedBranch }).populate('relatedProcedureItems');
    if (data.medicineItems) var medicineItems = await Stock.find({ relatedMedicineItems: { $in: data.medicineItems }, relatedBranch: data.relatedBranch }).populate('relatedMedicineItems');
    if (data.accessoryItems) accessoryResults = await Stock.find({ relatedAccessoryItems: { $in: data.accessoryItems }, relatedBranch: data.relatedBranch }).populate('relatedAccessoryItems');
    if (data.machine) var machine = await Stock.find({ relatedMachine: { $in: data.machine }, relatedBranch: data.relatedBranch }).populate('relatedMachine');
    return res.status(200).send({
      success: true,
      procedureItems: procedureItems,
      medicineItems: medicineItems,
      accessoryItems: accessoryResults,
      aicount: data.accessoryItems.length,
      aireturn: accessoryResults.length,
      machine: machine
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};


exports.getUsage = async (req, res) => {
  try {
    const result = await Usage.find({ _id: req.params.id }).populate('procedureMedicine.item_id procedureAccessory.item_id machine.item_id machineError.item_id procedureItemsError.item_id accessoryItemsError.item_id')
    if (result.length <= 0) return res.status(404).send({ error: true, message: 'Not Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (error) {
    return res.status(500).send({ success: true, message: error.message })
  }
}


exports.createUsage = async (req, res) => {
  let { relatedTreatmentSelection, relatedAppointment, procedureMedicine, procedureAccessory, machine } = req.body;
  let { relatedBranch } = req.body;
  let machineError = []
  let procedureItemsError = []
  let accessoryItemsError = []
  let machineFinished = []
  let procedureItemsFinished = []
  let accessoryItemsFinished = []
  let createdBy = req.credentials.id
  try {
    if (relatedBranch === undefined) return res.status(404).send({ error: true, message: 'Branch ID is required' })
    const appResult = await Appointment.find({ _id: req.body.relatedAppointment })
    let status;
    if (appResult[0].relatedUsage === undefined) {
      if (procedureMedicine !== undefined) {
        for (const e of procedureMedicine) {
          if (e.stock < e.actual) {
            procedureItemsError.push(e);
          } else if (e.stock > e.actual) {
            let totalUnit = e.stock - e.actual;
            const result = await Stock.find({ relatedProcedureItems: e.item_id, relatedBranch: relatedBranch });
            const from = result[0].fromUnit;
            const to = result[0].toUnit;
            const currentQty = (from * totalUnit) / to;
            try {
              const result = await Stock.findOneAndUpdate(
                { relatedProcedureItems: e.item_id, relatedBranch: relatedBranch },
                { totalUnit: totalUnit, currentQty: currentQty },
                { new: true }
              );
            } catch (error) {
              procedureItemsError.push(e);
            }
            procedureItemsFinished.push(e);
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedProcedureItems": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": totalUnit,
              "relatedBranch": relatedBranch,
              "type": "Usage",
              "createdBy": createdBy
            });
          }
        }
      }
      //procedureAccessory
      if (procedureAccessory !== undefined) {
        for (const e of procedureAccessory) {
          if (e.stock < e.actual) {
            accessoryItemsError.push(e)
          } else if (e.stock > e.actual) {
            let totalUnit = e.stock - e.actual
            const result = await Stock.find({ relatedAccessoryItems: e.item_id, relatedBranch: relatedBranch })
            const from = result[0].fromUnit
            const to = result[0].toUnit
            const currentQty = (from * totalUnit) / to
            try {
              accessoryItemsFinished.push(e)
              const result = await Stock.findOneAndUpdate(
                { relatedAccessoryItems: e.item_id, relatedBranch: relatedBranch },
                { totalUnit: totalUnit, currentQty: currentQty },
                { new: true },
              )

            } catch (error) {
              accessoryItemsError.push(e)
            }
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedAccessoryItems": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": totalUnit,
              "type": "Usage",
              "relatedBranch": relatedBranch,
              "createdBy": createdBy
            })
          }
        }
      }
      //machine
      if (machine !== undefined) {
        for (const e of machine) {
          if (e.stock < e.actual) {
            machineError.push(e)
          } else if (e.stock > e.actual) {
            const result = await Stock.find({ relatedMachine: e.item_id, relatedBranch: relatedBranch })
            let totalUnit = e.stock - e.actual
            const from = result[0].fromUnit
            const to = result[0].toUnit
            const currentQty = (from * totalUnit) / to
            try {
              machineFinished.push(e)
              const result = await Stock.findOneAndUpdate(
                { relatedMachine: e.item_id, relatedBranch: relatedBranch },
                { totalUnit: totalUnit, currentQty: currentQty },
                { new: true },
              )

            } catch (error) {
              machineError.push(e)
            }
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedMachine": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": totalUnit,
              "type": "Usage",
              "relatedBranch": relatedBranch,
              "createdBy": createdBy
            })
          }
        }
      }
      //usage create
      if (machineError.length > 0 || procedureItemsError.length > 0 || accessoryItemsError.length > 0) status = 'In Progress'
      if (machineError.length === 0 && procedureItemsError.length === 0 && accessoryItemsError.length === 0) status = 'Finished'
      req.body = { ...req.body, machineError: machineError, usageStatus: status, procedureItemsError: procedureItemsError, accessoryItemsError: accessoryItemsError, procedureAccessory: accessoryItemsFinished, procedureMedicine: procedureItemsFinished, machine: machineFinished }
      var usageResult = await Usage.create(req.body);
      var appointmentUpdate = await Appointment.findOneAndUpdate(
        { _id: req.body.relatedAppointment },
        { usageStatus: status, relatedUsage: usageResult._id },
        { new: true }
      )
      var usageRecordResult = await UsageRecords.create({
        relatedUsage: usageResult._id,
        usageStatus: status,
        procedureMedicine: procedureItemsFinished,
        procedureAccessory: accessoryItemsFinished,
        machine: machineFinished,
        relatedBranch: req.mongoQuery.relatedBranch,
        machineError: machineError,
        procedureItemsError: procedureItemsError,
        accessoryItemsError: accessoryItemsError
      })
    }
    else {
      var usageRecordResult = await UsageRecords.find({ relatedUsage: appResult[0].relatedUsage }, { sort: { createdAt: -1 } })
      if (usageRecordResult.length > 0) {
        var URResult = await UsageRecords.find({ _id: usageRecordResult[0]._id })
      }
      const newMachine = req.body.machine.filter(value => {
        const match = URResult[0].machineError.some(errorItem => errorItem.item_id.toString() === value.item_id);
        return match;
      });

      const newPA = req.body.procedureAccessory.filter(value => {
        const match = URResult[0].accessoryItemsError.some(errorItem => errorItem.item_id.toString() === value.item_id);
        return match;
      });

      const newPM = req.body.procedureMedicine.filter(value => {
        const match = URResult[0].procedureItemsError.some(errorItem => errorItem.item_id.toString() === value.item_id);
        return match;
      });

      if (newPM.length > 0) {
        for (const e of newPM) {
          if (e.stock < e.actual) {
            procedureItemsError.push(e)
          } else if (e.stock > e.actual) {
            let totalUnit = e.stock - e.actual
            const result = await Stock.find({ relatedProcedureItems: e.item_id, relatedBranch: relatedBranch })
            const from = result[0].fromUnit
            const to = result[0].toUnit
            const currentQty = (from * totalUnit) / to
            try {
              procedureItemsFinished.push(e)
              const result = await Stock.findOneAndUpdate(
                { relatedProcedureItems: e.item_id, relatedBranch: relatedBranch },
                { totalUnit: totalUnit, currentQty: currentQty },
                { new: true },
              )

            } catch (error) {
              procedureItemsError.push(e);
            }
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedProcedureItems": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": totalUnit,
              "type": "Usage",
              "relatedBranch": relatedBranch,
              "createdBy": createdBy
            })
          }
        }
      }

      //procedureAccessory

      if (newPA !== undefined) {
        for (const e of newPA) {
          if (e.stock < e.actual) {
            accessoryItemsError.push(e)
          } else if (e.stock > e.actual) {
            let totalUnit = e.stock - e.actual
            const result = await Stock.find({ relatedAccessoryItems: e.item_id, relatedBranch: relatedBranch })
            const from = result[0].fromUnit
            const to = result[0].toUnit
            const currentQty = (from * totalUnit) / to
            try {
              accessoryItemsFinished.push(e)
              const result = await Stock.findOneAndUpdate(
                { relatedAccessoryItems: e.item_id, relatedBranch: relatedBranch },
                { totalUnit: totalUnit, currentQty: currentQty },
                { new: true },
              )

            } catch (error) {
              accessoryItemsError.push(e)
            }
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedAccessoryItems": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": totalUnit,
              "type": "Usage",
              "relatedBranch": relatedBranch,
              "createdBy": createdBy
            })
          }
        }
      }

      //machine

      if (newMachine !== undefined) {
        for (const e of newMachine) {
          if (e.stock < e.actual) {
            machineError.push(e)
          } else if (e.stock > e.actual) {
            let totalUnit = e.stock - e.actual
            const result = await Stock.find({ relatedMachine: e.item_id, relatedBranch: relatedBranch })
            const from = result[0].fromUnit
            const to = result[0].toUnit
            const currentQty = (from * totalUnit) / to
            try {
              machineFinished.push(e)
              const result = await Stock.findOneAndUpdate(
                { relatedMachine: e.item_id, relatedBranch: relatedBranch },
                { totalUnit: totalUnit, currentQty: currentQty },
                { new: true },
              )

            } catch (error) {
              machineError.push(e)
            }
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedMachine": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": totalUnit,
              "type": "Usage",
              "relatedBranch": relatedBranch,
              "createdBy": createdBy
            })
          }
        }
      }
      req.body = { ...req.body, machineError: machineError, procedureItemsError: procedureItemsError, accessoryItemsError: accessoryItemsError }
      if (machineError.length > 0 || procedureItemsError.length > 0 || accessoryItemsError.length > 0) status = 'In Progress'
      if (machineError.length === 0 && procedureItemsError.length === 0 && accessoryItemsError.length === 0) status = 'Finished'
      var usageUpdate = await Usage.findOneAndUpdate(
        { _id: appResult[0].relatedUsage },
        {
          $push: {
            procedureAccessory: { $each: accessoryItemsFinished },
            procedureMedicine: { $each: procedureItemsFinished },
            machine: { $each: machineFinished }
          },
          procedureItemsError: procedureItemsError,
          accessoryItemsError: accessoryItemsError,
          machineError: machineError,
          usageStatus: status,
          relatedBranch: req.mongoQuery.relatedBranch
        },
        { new: true }
      );
      var usageRecordResult = await UsageRecords.create({
        relatedUsage: usageUpdate._id,
        usageStatus: status,
        procedureMedicine: procedureItemsFinished,
        procedureAccessory: accessoryItemsFinished,
        machine: machineFinished,
        relatedBranch: req.mongoQuery.relatedBranch,
        machineError: machineError,
        procedureItemsError: procedureItemsError,
        accessoryItemsError: accessoryItemsError
      })
    }
    //error handling
    let response = { success: true }
    if (machineError.length > 0) response.machineError = machineError
    if (procedureItemsError.length > 0) response.procedureItemsError = procedureItemsError
    if (accessoryItemsError.length > 0) response.accessoryItemsError = accessoryItemsError
    if (usageResult !== undefined) response.usageResult = usageResult
    if (usageRecordResult !== undefined) response.usageRecordResult = usageRecordResult
    if (appointmentUpdate !== undefined) response.appointmentUpdate = appointmentUpdate
    if (URResult !== undefined) response.URResult = URResult
    if (usageUpdate !== undefined) response.usageUpdate = usageUpdate

    return res.status(200).send(response)
  } catch (error) {
    // console.log(error)
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.getUsageRecordsByUsageID = async (req, res) => {
  try {
    let query = req.mongoQuery;
    if (req.params.id) query.relatedUsage = req.params.id
    const result = await UsageRecords.find(query).populate('relatedUsage procedureMedicine.item_id procedureAccessory.item_id machine.item_id machineError.item_id procedureItemsError.item_id accessoryItemsError.item_id')
    return res.status(200).send({ success: true, data: result })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}