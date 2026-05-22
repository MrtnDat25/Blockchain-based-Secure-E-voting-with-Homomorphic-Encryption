import axios from "axios";

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzNWU1NzdkNi00NjBhLTRjNDItYmFmZS1jNWQxMTEzZGI0MjIiLCJlbWFpbCI6ImRxZGF0a21hMjAwNEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMjM1MTk4ZjE3MTg3ZjRlNWJhYzkiLCJzY29wZWRLZXlTZWNyZXQiOiI1ZjE3NDA1ZjJlZTY4M2JiYjQ2MzQwNzg3OGFlNjA2ZDUxNDE4OGM2NGQ5NGZhNzBkYmQyMWE3NDkyZWY1YmJkIiwiZXhwIjoxODEwOTgyOTYwfQ.E5ECA7k9tCGMgS45gxMRVpo-kmodlr5prm6mAjxU1dk";

export const uploadToPinata = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data.IpfsHash;
};