import dbConnect from "../../../config/database";
import Voter from "../../../models/Voter";

export default async function handler(req, res) {

  await dbConnect();

  const { id } = req.query;

  if (req.method === "DELETE") {

    try {

      const deleted = await Voter.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({
          status: "error",
          message: "Voter not found"
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Delete success"
      });

    } catch (err) {

      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }
  }

  return res.status(405).json({
    message: "Method not allowed"
  });
}