const mongoose = require("mongoose");

const VoterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  election_address: {
    type: String,
    required: true,
  },
});

module.exports =
  mongoose.models.Voter ||
  mongoose.model("Voter", VoterSchema);