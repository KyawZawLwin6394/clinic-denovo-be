const cors = require('cors');
const path = require('path');
const createIndexs = require('./dbIndexes').createIndex
const express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  config = require('./config/db'),
  app = express(),
  server = require('http').Server(app),
  port = 9000;
app.use(cors({ origin: '*' }));

//mongoose.set('useCreateIndex', true) // to remove -> DeprecationWarning: collection.ensureIndex is deprecated. Use createIndex instead.

// mongoose instance connection url connection
if (mongoose.connection.readyState != 1) {
  mongoose.Promise = global.Promise;
  mongoose.connect(config.db, { useNewUrlParser: true, retryWrites: false, useUnifiedTopology: true });

  const db = mongoose.connection;

  db.on('error', (err) => {
    console.log(err)
  });

  db.once('open', function () {
    console.log('Database is connected');
  });

  // db.collection('patients').createIndex({ name: 'text', phone: 'text', email: 'text', patientID: 'text' }, function (err, result) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log("Patient Indexes Created Successfully!");
  //   }

  //   db.collection('appointments').createIndex({
  //     status: 'text',
  //     phone: 'text'
  //   }, function (err, result) {
  //     if (err) {
  //       console.log(err)
  //     } else {
  //       console.log("Appointment Indexes Created Successfully!")
  //     }
  //   })

  //   db.collection('brands').createIndex({
  //     code: 'text',
  //     name: 'text'
  //   }, function (err, result) {
  //     if (err) {
  //       console.log(err)
  //     } else {
  //       console.log('Brand Indexes Created Successfully!')
  //     }
  //   })

  //   db.collection('treatmentlists').createIndex({
  //     code: 'text',
  //     name: 'text'
  //   }, function (err, result) {
  //     if (err) { console.log(err) } else { console.log('Treatment List Indexes Created Successfully!') }
  //   })

  //   db.collection('currencies').createIndex({
  //     code: 'text',
  //     name: 'text'
  //   }, function (err, result) {
  //     if (err) { console.log(err) } else { console.log('Currency Indexes Created Successfully!') }
  //   })

  //   db.collection('medicineitems').createIndex({
  //     code: 'text',
  //     medicineItemName: 'text'
  //   }, function (err, result) {
  //     if (err) { console.log(err) } else { console.log('medicineItems Indexes Created Successfully!') }
  //   })

  //   db.collection('accessoryitems').createIndex({
  //     code: 'text',
  //     accessoryItemName: 'text'
  //   }, function (err, result) {
  //     if (err) { console.log(err) } else { console.log('Accessory Items Indexes Created Successfully!') }
  //   })

  //   db.collection('procedureitems').createIndex({
  //     code: 'text',
  //     procedureItemName: 'text'
  //   }, function (err, result) {
  //     if (err) { console.log(err) } else { console.log('Procedure Items Indexes Created Successfully!') }
  //   })

  //   db.collection('procedureaccessories').createIndex({
  //     code: 'text',
  //     name: 'text'
  //   }, function (err, result) {
  //     if (err) { console.log(err) } else { console.log('Procedure Accessories Indexes Created Successfully!') }
  //   })

  //   db.collection('proceduremedicines').createIndex({
  //     code: 'text',
  //     name: 'text'
  //   }, function (err, result) {
  //     if (err) { console.log(err) } else { console.log('Procedure Medicine Indexes Created Successfully!') }
  //   })

  //   db.collection('medicinelists').createIndex({
  //     code: 'text',
  //     procedureItemName: 'text'
  //   }, function (err, result) {
  //     if (err) { console.log(err) } else { console.log('Medicine Lists Indexes Created Successfully!') }
  //   })

  //   db.collection('treatments').createIndex({
  //     treatmentCode: 'text',
  //     treatmentName: 'text'
  //   }, function (err, result) {
  //     if (err) { console.log(err) } else { console.log('Treatment Indexes Created Successfully!') }
  //   })

  //   db.collection('treatmentselections').createIndex({
  //     code: 'text',
  //     selectionStatus: 'text'
  //   }, function (err, result) {
  //     if (err) { console.log(err) } else { console.log('Treatment Indexes Created Successfully!') }
  //   })

  // });
  module.exports = db;
}
mongoose.plugin((schema) => {
  schema.options.usePushEach = true;
});

//static files
app.use('/static', express.static(path.join(__dirname, 'uploads')));

// Bring in our dependencies
require('./config/express')(app, config);

server.listen(port, () => {
  console.log('We are live on port: ', port);
});

