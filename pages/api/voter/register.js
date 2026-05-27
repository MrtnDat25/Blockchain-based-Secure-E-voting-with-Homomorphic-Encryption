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
      election_address,
    } = req.body;

    email = email
      ?.trim()
      .toLowerCase();

    if (
      !email ||
      !election_address
    ) {
      return res.status(400).json({
        status: "error",
        message: "Missing fields",
      });
    }

    // =====================
    // CHECK VOTER EXIST
    // =====================

    let voter =
      await VoterModel.findOne({
        email,
      });

    // =====================
    // CREATE ACCOUNT
    // =====================

    if (!voter) {

      const hashedPassword =
        await bcrypt.hash(
          email,
          10
        );

      voter =
        await VoterModel.create({
          email,
          password:
            hashedPassword,
        });
    }

    // =====================
    // CHECK MAPPING
    // =====================

    const existingMapping =
      await ElectionVoterModel.findOne({
        email,
        election_address,
      });

    if (existingMapping) {

      return res.status(400).json({
        status: "error",
        message:
          "Voter already exists in this election",
      });
    }

    // =====================
    // CREATE MAPPING
    // =====================

    await ElectionVoterModel.create({
      email,
      election_address,
    });

    return res.status(200).json({
      status: "success",
      message:
        "Voter added successfully",
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
}