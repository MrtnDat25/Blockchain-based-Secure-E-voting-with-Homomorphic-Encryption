import mongoose from "mongoose";

const ElectionVoterSchema =
  new mongoose.Schema(
    {
      email: String,

      election_address: String,
    },
    {
      timestamps: true,
    }
  );

export default
  mongoose.models.ElectionVoter ||
  mongoose.model(
    "ElectionVoter",
    ElectionVoterSchema
  );