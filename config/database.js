const mongoose = require('mongoose');

const MONGO_URL = 'mongodb://127.0.0.1:27017/voting_db';

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

module.exports = mongoose;