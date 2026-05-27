import dbConnect from "../../../config/database";
import VoterModel from "../../../models/voter";

export default async function handler(req, res) {

  console.log("METHOD:", req.method);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "PUT") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed",
    });
  }

  await dbConnect();

  try {

    const {
      email,
      oldPassword,
      newPassword,
      election_address,
    } = req.body;

    const voter = await VoterModel.findOne({
      email,
      election_address,
    });

    if (!voter) {
      return res.status(404).json({
        status: "error",
        message: "Voter not found",
      });
    }

    if (voter.password !== oldPassword) {
      return res.status(400).json({
        status: "error",
        message: "Wrong old password",
      });
    }

    voter.password = newPassword;

    await voter.save();

    return res.status(200).json({
      status: "success",
      message: "Password updated",
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
}