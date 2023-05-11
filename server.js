const cors = require('cors');
const path = require('path');
const createIndexs = require('./dbIndexes').createIndexes
const express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  config = require('./config/db'),
  app = express(),
  server = require('http').Server(app),
  port = 9000;
app.use(cors({ origin: '*'}));

//mongoose.set('useCreateIndex', true) // to remove -> DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.

// mongoose instance connection url connection
if (mongoose.connection.readyState != 1) {
  mongoose.Promise = global.Promise;
  mongoose.connect(config.db, { useNewUrlParser: true, retryWrites: false, useUnifiedTopology: true });

  const db = mongoose.connection;
  
  db.on('error', (err) => {
    console.log(err)  });

  db.once('open', function () {
    console.log('Database is connected');
  });
  module.exports = db;
}
mongoose.plugin((schema) => {
  schema.options.usePushEach = true;
});

//static files
app.use('/static', express.static(path.join(__dirname, 'uploads')));

// Bring in our dependencies
require('./config/express')(app, config);

//createIndexs()
server.listen(port, () => {
  console.log('We are live on port: ', port);
});

