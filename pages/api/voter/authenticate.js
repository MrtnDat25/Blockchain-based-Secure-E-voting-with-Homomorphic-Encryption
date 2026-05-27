import dbConnect from "../../../config/database";

import VoterModel from "../../../models/voter";

import ElectionVoterModel from "../../../models/electionVoter";

import bcrypt from "bcryptjs";

export default async function handler(
  req,
  res
) {

  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed",
    });
  }

  try {

    await dbConnect();

    let {
      email,
      password,
    } = req.body;

    email = email
      ?.trim()
      .toLowerCase();

    const voter =
      await VoterModel.findOne({
        email,
      });

    if (!voter) {
      return res.status(404).json({
        status: "error",
        message: "Voter not found",
      });
    }

    const match =
      await bcrypt.compare(
        password,
        voter.password
      );

    if (!match) {
      return res.status(400).json({
        status: "error",
        message: "Wrong password",
      });
    }

    // lấy election đầu tiên
    const mapping =
      await ElectionVoterModel.findOne({
        email,
      });

    if (!mapping) {
      return res.status(404).json({
        status: "error",
        message:
          "No election found",
      });
    }

    return res.status(200).json({
      status: "success",

      data: {
        email,
        election_address:
          mapping.election_address,
      },
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
}