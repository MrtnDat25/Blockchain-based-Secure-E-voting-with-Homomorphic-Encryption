const VoterModel = require("../models/voter");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs"); // giữ nếu sau này bạn upgrade password
const saltRounds = 10;

/**
 * CREATE VOTER
 */
module.exports.create = async function (req, res) {
  try {
    const {
      email,
      election_address,
      election_name,
      election_description,
    } = req.body;

    // check tồn tại
    const existing = await VoterModel.findOne({
      email,
      election_address,
    });

    if (existing) {
      return res.json({
        status: "error",
        message: "Voter already exists",
      });
    }

    // tạm thời password = email
    const password = email;

    const voter = await VoterModel.create({
      email,
      password,
      election_address,
    });

    // mail setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: election_name,
      html: `
        ${election_description}
        <br><br>
        Your voting id: <b>${email}</b><br>
        Your password: <b>${password}</b><br>
        <a href="http://localhost:3000/homepage">Click here</a>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      status: "success",
      message: "Voter added successfully",
      data: voter,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

/**
 * AUTHENTICATE
 */
module.exports.authenticate = async function (req, res) {
  try {
    const { email, password } = req.body;

    const voter = await VoterModel.findOne({
      email,
      password,
    });

    if (!voter) {
      return res.json({
        status: "error",
        message: "Invalid email/password",
      });
    }

    return res.json({
      status: "success",
      message: "voter found",
      data: {
        id: voter._id,
        election_address: voter.election_address,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

/**
 * GET ALL VOTERS
 */
module.exports.getAll = async function (req, res) {
  try {
    const voters = await VoterModel.find({
      election_address: req.body.election_address,
    });

    const voterList = voters.map((v) => ({
      id: v._id,
      email: v.email,
    }));

    return res.json({
      status: "success",
      message: "voters list found",
      data: {
        voters: voterList,
      },
      count: voterList.length,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

/**
 * UPDATE VOTER
 */
module.exports.updateById = async function (req, res) {
  try {
    const { voterId } = req.params;
    const { email, election_name, election_description } = req.body;

    const existing = await VoterModel.findOne({ email });

    if (existing) {
      return res.json({
        status: "error",
        message: "Voter already exists",
      });
    }

    const password = email; // tạm thời

    const voter = await VoterModel.findByIdAndUpdate(
      voterId,
      { email, password },
      { new: true }
    );

    const updatedVoter = await VoterModel.findById(voterId);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: updatedVoter.email,
      subject: election_name,
      html: `
        ${election_description}
        <br>Your voting id: ${updatedVoter.email}
        <br>Your password: ${updatedVoter.password}
      `,
    });

    return res.json({
      status: "success",
      message: "Voter updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

/**
 * DELETE VOTER
 */
module.exports.deleteById = async function (req, res) {
  try {
    const { voterId } = req.params;

    await VoterModel.findByIdAndDelete(voterId);

    return res.json({
      status: "success",
      message: "voter deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

/**
 * RESULT MAIL
 */
module.exports.resultMail = async function (req, res) {
  try {
    const { election_address, election_name, winner_candidate, candidate_email } =
      req.body;

    const voters = await VoterModel.find({ election_address });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    // gửi cho voters
    for (const voter of voters) {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: voter.email,
        subject: `${election_name} results`,
        html: `
          The results are out.<br>
          Winner: <b>${winner_candidate}</b>
        `,
      });
    }

    // gửi cho candidate
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: candidate_email,
      subject: `${election_name} results`,
      html: `Congratulations! You won ${election_name}`,
    });

    return res.json({
      status: "success",
      message: "mails sent successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};