const next = require('next');
const express = require('express');
const voter = require('./routes/voter');
const company = require('./routes/company');
const candidate = require('./routes/candidate');
const bodyParser = require('body-parser');
const mongoose = require('./config/database');
const path = require('path');


mongoose.connection.on('connected', () => {
  console.log("✅ MongoDB is CONNECTED");
});
require('dotenv').config({ path: __dirname + '/.env' });

const exp = express();

exp.use(bodyParser.urlencoded({ extended: true }));
exp.use(bodyParser.json());

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

exp.get('/', (req, res) => {
  res.send("API running");
});

// API routes
exp.use('/company', company);
exp.use('/voter', voter);
exp.use('/candidate', candidate);

// NEXT
const app = next({
  dev: process.env.NODE_ENV !== 'production',
});

app.prepare().then(() => {
  exp.listen(3000, () => {
    console.log('Server running on 3000');
  });
});