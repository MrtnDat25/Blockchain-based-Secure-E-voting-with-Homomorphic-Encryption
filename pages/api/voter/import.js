import dbConnect from "../../../config/database";

import VoterModel from "../../../models/voter";

import ElectionVoterModel from "../../../models/electionVoter";

import XLSX from "xlsx";

import formidable from "formidable";

import fs from "fs";

import bcrypt from "bcryptjs";

export const config = {
  api: {
    bodyParser: false,
  },
};

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

    const form = formidable({
      multiples: false,
    });

    form.parse(
      req,
      async (
        err,
        fields,
        files
      ) => {

        try {

          if (err) {
            return res.status(500).json({
              status: "error",
              message: err.message,
            });
          }

          const file =
            files.file?.[0] ||
            files.file;

          if (!file) {
            return res.status(400).json({
              status: "error",
              message:
                "No file uploaded",
            });
          }

          const election_address =
            Array.isArray(
              fields.election_address
            )
              ? fields
                  .election_address[0]
              : fields.election_address;

          if (!election_address) {
            return res.status(400).json({
              status: "error",
              message:
                "Missing election address",
            });
          }

          // =====================
          // READ EXCEL
          // =====================

          const workbook =
            XLSX.readFile(
              file.filepath
            );

          const sheet =
            workbook.Sheets[
              workbook.SheetNames[0]
            ];

          const rows =
            XLSX.utils.sheet_to_json(
              sheet
            );

          let inserted = 0;

          for (const row of rows) {

            let email =
              row.email ||
              row.Email ||
              row.EMAIL;

            if (!email) continue;

            email = String(email)
              .trim()
              .toLowerCase();

            // =====================
            // CHECK VOTER EXISTS
            // =====================

            let voter =
              await VoterModel.findOne({
                email,
              });

            // =====================
            // CREATE NEW VOTER
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
            // CHECK RELATION EXISTS
            // =====================

            const existingRelation =
              await ElectionVoterModel.findOne(
                {
                  email,
                  election_address,
                }
              );

            if (existingRelation) {
              continue;
            }

            // =====================
            // CREATE RELATION
            // =====================

            await ElectionVoterModel.create({
              email,
              election_address,
            });

            inserted++;
          }

          fs.unlinkSync(
            file.filepath
          );

          return res.status(200).json({
            status: "success",
            inserted,
          });

        } catch (innerErr) {

          console.log(
            "IMPORT ERROR:",
            innerErr
          );

          return res.status(500).json({
            status: "error",
            message:
              innerErr.message,
          });
        }
      }
    );

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
}