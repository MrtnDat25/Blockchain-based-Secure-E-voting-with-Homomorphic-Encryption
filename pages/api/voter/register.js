import dbConnect from "../../../config/database";
import VoterModel from "../../../models/voter";
import nodemailer from "nodemailer";

export default async function handler(req, res) {

  try {

    console.log("API REGISTER HIT");

    await dbConnect();

    console.log("DB CONNECTED");

    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Method not allowed",
      });
    }

    console.log("BODY:", req.body);

    const {
      email,
      election_address,
      election_name,
      election_description,
    } = req.body;

    if (!email || !election_address) {
      return res.status(400).json({
        status: "error",
        message: "Missing fields",
      });
    }

    const existing = await VoterModel.findOne({
      email,
      election_address,
    });

    console.log("CHECK EXIST DONE");

    if (existing) {
      return res.status(400).json({
        status: "error",
        message: "Voter already exists",
      });
    }

    const password = email;

    const voter = await VoterModel.create({
      email,
      password,
      election_address,
    });

    console.log("VOTER CREATED");

    // TEMP: TẮT EMAIL ĐỂ TEST
    /*
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: election_name,
      html: `
        ${election_description}<br/>
        Your ID: ${email}<br/>
        Password: ${password}
      `,
    });
    */

    console.log("EMAIL SENT");

    return res.status(200).json({
      status: "success",
      message: "Voter registered successfully",
      data: voter,
    });

  } catch (err) {

    console.log("REGISTER ERROR:");
    console.log(err);

    return res.status(500).json({
      status: "error",
      message: err.message,
      stack: err.stack,
    });
  }
}