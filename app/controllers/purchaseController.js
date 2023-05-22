'use strict';
const Purchase = require('../models/purchase');
const MedicineItems = require('../models/medicineItem');
const ProcedureItems = require('../models/procedureItem');
const AccessoryItems = require('../models/accessoryItem')

exports.listAllPurchases = async (req, res) => {
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
        let result = await Purchase.find(query).populate('supplierName').populate('medicineItems.item_id').populate('procedureItems.item_id')
        count = await Purchase.find(query).count();
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

exports.getPurchase = async (req, res) => {
    const result = await Purchase.find({ _id: req.params.id, isDeleted: false }).populate('supplierName').populate('medicineItems.item_id').populate('procedureItems.item_id')
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createPurchase = async (req, res, next) => {
    let data = req.body
    try {
        data.medicineItems.map(async function (element, index) {
            const result = await MedicineItems.findOneAndUpdate(
                { _id: element.item_id },
                { $inc: { currentQuantity: element.qty  } },
                { new: true },
            ).populate('supplierName').populate('medicineItems.item_id').populate('procedureItems.item_id')
            console.log(result)
        })
        data.procedureItems.map(async function (element, index) {
            const result = await ProcedureItems.findOneAndUpdate(
                { _id: element.item_id },
                { $inc: { currentQuantity: element.qty  } },
                { new: true },
            ).populate('name').populate('relatedCategory').populate('relatedBrand').populate('relatedSubCategory')
            console.log(result)
        })
        data.accessoryItems.map(async function (element, index) {
            const result = await AccessoryItems.findOneAndUpdate(
                { _id: element.item_id },
                { $inc: { currentQuantity: element.qty  } },
                { new: true },
            ).populate('name').populate('relatedCategory').populate('relatedBrand').populate('relatedSubCategory')
            console.log(result)
        })
        const newPurchase = new Purchase(data);
        const result = await newPurchase.save();
        res.status(200).send({
            message: 'Purchase create success',
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updatePurchase = async (req, res, next) => {
    try {
        const result = await Purchase.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('supplierName').populate('medicineItems.item_id').populate('procedureItems.item_id')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deletePurchase = async (req, res, next) => {
    try {
        const result = await Purchase.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activatePurchase = async (req, res, next) => {
    try {
        const result = await Purchase.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
