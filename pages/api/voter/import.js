import dbConnect from "../../../config/database";
import VoterModel from "../../../models/voter";
import XLSX from "xlsx";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {

  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed",
    });
  }

  try {

    const form = formidable({
      multiples: false,
    });

    form.parse(req, async (err, fields, files) => {

      try {

        if (err) {
          return res.status(500).json({
            status: "error",
            message: err.message,
          });
        }

        // =========================
        // GET FILE
        // =========================

        const file = files.file?.[0] || files.file;

        if (!file) {
          return res.status(400).json({
            status: "error",
            message: "No file uploaded",
          });
        }

        // =========================
        // GET ELECTION ADDRESS
        // =========================

        const electionAddress = Array.isArray(
          fields.election_address
        )
          ? fields.election_address[0]
          : fields.election_address;

        if (!electionAddress) {
          return res.status(400).json({
            status: "error",
            message: "Missing election address",
          });
        }

        // =========================
        // READ EXCEL
        // =========================

        const workbook = XLSX.readFile(
          file.filepath
        );

        const sheetName =
          workbook.SheetNames[0];

        const worksheet =
          workbook.Sheets[sheetName];

        const rows =
          XLSX.utils.sheet_to_json(
            worksheet
          );

        // =========================
        // VALIDATE EMAIL
        // =========================

        const validateEmail = (email) => {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
          );
        };

        // =========================
        // BUILD VOTERS ARRAY
        // =========================

        const voters = [];

        const invalidEmails = [];

        for (const row of rows) {

          const email =
            row.email ||
            row.Email ||
            row.EMAIL;

          if (!email) continue;

          const cleanEmail = String(email)
            .trim()
            .toLowerCase();

          // invalid email
          if (!validateEmail(cleanEmail)) {

            invalidEmails.push(cleanEmail);

            continue;
          }

          voters.push({
            email: cleanEmail,
            password: cleanEmail,
            election_address:
              electionAddress,
          });
        }

        // =========================
        // REMOVE DUPLICATES
        // =========================

        const emails = voters.map(
          (v) => v.email
        );

        const existingVoters =
          await VoterModel.find({
            election_address:
              electionAddress,
            email: {
              $in: emails,
            },
          });

        const existingEmails =
          existingVoters.map(
            (v) => v.email
          );

        const uniqueVoters =
          voters.filter(
            (v) =>
              !existingEmails.includes(
                v.email
              )
          );

        // =========================
        // INSERT MANY
        // =========================

        if (uniqueVoters.length > 0) {

          await VoterModel.insertMany(
            uniqueVoters
          );
        }

        // =========================
        // DELETE TEMP FILE
        // =========================

        fs.unlinkSync(file.filepath);

        // =========================
        // RESPONSE
        // =========================

        return res.status(200).json({
          status: "success",
          inserted: uniqueVoters.length,
          duplicates:
            voters.length -
            uniqueVoters.length,
          invalid: invalidEmails.length,
          invalidEmails,
        });

      } catch (innerErr) {

        console.log(
          "IMPORT ERROR:",
          innerErr
        );

        return res.status(500).json({
          status: "error",
          message: innerErr.message,
        });
      }
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
}