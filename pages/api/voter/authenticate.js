import dbConnect from "../../../config/database";
const voterController = require("../../../controllers/voter");

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    return voterController.authenticate(req, res);
  }

  return res.status(405).json({
    message: "Method not allowed",
  });
}