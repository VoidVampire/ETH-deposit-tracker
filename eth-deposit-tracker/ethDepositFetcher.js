const { Alchemy, Network } = require("alchemy-sdk");
const logger = require("./logger");
require("dotenv").config();

// Using Testnet (Sepolia) or Mainnet
const isTestnet = true;

// Initialize Alchemy SDK
const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: isTestnet ? Network.ETH_SEPOLIA : Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);
const BEACON_DEPOSIT_CONTRACT = isTestnet
  ? "0x62f523355cC9ec3F154e448ed9D7a0AB53AAAc2a" // Sepolia's Contract Address
  : "0x00000000219ab540356cBB839Cbe05303d7705Fa"; // ETH Address given in Task;

// Function to get logs for deposit events using Alchemy
async function getDepositLogs(fromBlock) {
  try {
    const logs = await alchemy.core.getLogs({
      address: BEACON_DEPOSIT_CONTRACT,
      fromBlock: fromBlock,
      toBlock: "latest",
      topics: [],
    });
    logger.info(`Fetched logs from block ${fromBlock}`);
    return logs;
  } catch (error) {
    logger.error(`Error fetching logs: ${error.message}`);
  }
}

// Function to get transaction details (to track internal transactions)
async function getTransactionDetails(txHash) {
  try {
    const transactionReceipt = await alchemy.core.getTransactionReceipt(txHash);
    logger.info(`Fetched transaction details for hash: ${txHash}`);
    return transactionReceipt;
  } catch (error) {
    logger.error(
      `Error fetching transaction details for hash ${txHash}: ${error.message}`
    );
  }
}

// Function to get block details (for the timestamp)
async function getBlockTimestamp(blockNumber) {
  try {
    const block = await alchemy.core.getBlock(blockNumber);
    logger.info(`Fetched block timestamp for block number: ${blockNumber}`);
    return block.timestamp;
  } catch (error) {
    logger.error(
      `Error fetching block details for block number ${blockNumber}: ${error.message}`
    );
  }
}

module.exports = {
  getDepositLogs,
  getTransactionDetails,
  getBlockTimestamp,
};
