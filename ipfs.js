import { create } from "ipfs-http-client";

const projectId = "IPFS-testing";
const projectSecret = "63e40dd6bbe24dfb872e35b2ad88506b";

const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

export default ipfs;