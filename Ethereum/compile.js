const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");

const buildPath = path.resolve(__dirname, "Build");
fs.removeSync(buildPath);

const contractPath = path.resolve(
  __dirname,
  "contracts",
  "Election.sol"
);

const source = fs.readFileSync(contractPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "Election.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

const compiled = JSON.parse(
  solc.compile(JSON.stringify(input))
);


// IN TOÀN BỘ KẾT QUẢ
console.log(JSON.stringify(compiled, null, 2));


// IN LỖI
if (compiled.errors) {
  compiled.errors.forEach((err) => {
    console.log(err.formattedMessage);
  });
}


// DỪNG NẾU FAIL
if (!compiled.contracts) {
  process.exit(1);
}

fs.ensureDirSync(buildPath);

for (let contractName in compiled.contracts["Election.sol"]) {

  fs.outputJsonSync(
    path.resolve(buildPath, `${contractName}.json`),
    compiled.contracts["Election.sol"][contractName]
  );

  console.log(`Compiled: ${contractName}`);
}

console.log("Compilation successful!");