require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [
        "0x53f7b0d0ca8130d8e0759f7c9f5bccf376e83cc5da742c6cb055018da3fc1a3c"
      ]
    }
  }
};