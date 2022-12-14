//////////////////////////////////////////////////////////////////////////////////////////
// PACKAGES
//////////////////////////////////////////////////////////////////////////////////////////
// BASE
require("@nomiclabs/hardhat-waffle");
require("ethereum-waffle");
require("@nomiclabs/hardhat-ethers");
require("ethers");
require("@nomiclabs/hardhat-etherscan");
// TEST
require("chai");
// require("solidity-coverage");
// UTILS
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
var assert = require("assert");
var readline = require("readline");

function gwei(val) {
  return ethers.utils.parseUnits(val.toString(), "gwei");
}


//////////////////////////////////////////////////////////////////////////////////////////
// DEPLOYED
//////////////////////////////////////////////////////////////////////////////////////////

// 0xaC3D006f6332981fD1a0CE2055Fa42786aAF16F9

//////////////////////////////////////////////////////////////////////////////////////////
// KEYS
//////////////////////////////////////////////////////////////////////////////////////////
const alchemyKey = process.env.ALCHEMY_API_KEY;
const privateKey = process.env.NETWORK_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const coinmarketcapKey = process.env.COINMARKETCAP_KEY;

const etherscanKey = process.env.ETHERSCAN_KEY;
const polygonscanKey = process.env.POLYGONSCAN_KEY;

//////////////////////////////////////////////////////////////////////////////////////////
// CONFIG
//////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
  solidity: {
    version: "0.8.1",
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000,
      },
    },
  },
  mocha: {
    timeout: 1000000000,
  },
  networks: {
    // ETHEREUM
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${alchemyKey}`,
      accounts: [`${privateKey}`],
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${alchemyKey}`,
      accounts: [`${privateKey}`],
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${alchemyKey}`,
      accounts: [`${privateKey}`],
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${alchemyKey}`,
      accounts: [`${privateKey}`],
    },
    // POLYGON
    polygon: {
      url: "https://matic-mainnet.chainstacklabs.com",
      accounts: [`${privateKey}`],
    },
    mumbai: {
      // url: "https://rpc-mumbai.matic.today/",
      url: "https://matic-mumbai.chainstacklabs.com",
      accounts: [`${privateKey}`],
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    token: process.env.GASREPORTER_CURRENCY || "ETH",
    gasPrice: 300,
    coinmarketcap: coinmarketcapKey,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
    only: ["TheSquids", "TheSquidsTournament"],
  },
  etherscan: {
    apiKey: {
      // ETHEREUM
      mainnet: etherscanKey,
      ropsten: etherscanKey,
      rinkeby: etherscanKey,
      goerli: etherscanKey,
      kovan: etherscanKey,

      // POLYGON
      polygon: polygonscanKey,
      polygonMumbai: polygonscanKey,
    },
  },
};

//////////////////////////////////////////////////////////////////////////////////////////
// TASKS
//////////////////////////////////////////////////////////////////////////////////////////
function gwei(val) {
  return ethers.utils.parseUnits(val.toString(), "gwei");
}

async function mainnet_check() {
  if (network.name !== "mainnet" && network.name !== "polygon") return;

  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("YOU ARE ON MAINNET!!!");
  const okay = (await rl.question("continue (y/n): ")) === "y";
  if (!okay) {
    process.exit(1);
  }
}

async function logPreInfo(contractName, deployer, gp) {
  const addr = deployer.address;
  if (addr === "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266") {
    console.log("WARNING: deploying with dummy");
  }

  const b1 = (await deployer.getBalance()).toString();

  let msg = "";
  msg += `Contract: ${contractName} (${network.name})\n`;
  msg += `Deployer: ${addr}\n`;
  msg += `Balance:  ${ethers.utils.formatUnits(b1, 18)}??\n`;
  if (gp !== undefined) {
    msg += `Price:    ${args.gp} gwei\n`;
  }
  console.log(msg);
}

async function logPostInfo(deployer, contract, contractArgs) {
  const b2 = (await deployer.getBalance()).toString();
  console.log(`Balance:  ${ethers.utils.formatUnits(b2, 18)}??`);
  console.log(`Contract: ${contract.address}`);

  let verificationArgs = `${contract.address} `;
  for (let i = 0; i < contractArgs.length; ++i) {
    let arg = contractArgs[i];
    verificationArgs += `${arg} `;
  }

  console.log(`hh v --network ${network.name} ${verificationArgs}`);
}

function isEth() {
  return (
    network.name === "mainnet" ||
    network.name === "goerli" ||
    network.name === "kovan" ||
    network.name === "ropsten" ||
    network.name === "rinkeby" ||
    network.name === "hardhat" ||
    network.name === "localhost"
  );
}

function isPolygon() {
  return (
    network.name === "polygon" ||
    network.name === "mumbai" ||
    network.name === "hardhat" ||
    network.name == "localhost"
  );
}

function getPolygonChildManager() {
  if (network.name == "polygon") {
    return "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa";
  }

  return "0xb5505a6d998549090530911180f38aC5130101c6";
}

async function deploy(contractName, args, ...contractArgs) {
  // TODO
  // await mainnet_check();

  await logPreInfo(contractName, args.deployer, args.gp);

  let gasArgs = {};
  if (args.gp !== undefined) {
    gasArgs = { gasPrice: gwei(gp) };
  }

  const Contract = await ethers.getContractFactory(contractName);
  let contract = await Contract.deploy(...contractArgs, gasArgs);

  await logPostInfo(args.deployer, contract, contractArgs);

  return [contract, contractArgs];
}

task("deploy", "deploys a smartcontract")
  .addParam("c", "name of the contract")
  .addOptionalParam("gp", "a gas price to deploy for")
  .setAction(async (args, hre) => {
    const [deployer] = await ethers.getSigners();
    args.deployer = deployer;

    switch (args.c) {
      case "erc721": {
        await deploy("BasicERC721", args);
        break;
      }
    }
  });
