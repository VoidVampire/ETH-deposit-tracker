const { Alchemy, Network } = require("alchemy-sdk");
const {
  bufferToHex,
  ecrecover,
  pubToAddress,
  fromRpcSig,
  keccak256,
} = require("ethereumjs-util");
const logger = require("./logger");
require("dotenv").config();

// Using Testnet (Sepolia) or Mainnet
const isTestnet = false;

// Initialize Alchemy SDK
const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: isTestnet ? Network.ETH_SEPOLIA : Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);
const BEACON_DEPOSIT_CONTRACT = isTestnet
  ? "0x62f523355cC9ec3F154e448ed9D7a0AB53AAAc2a" // Sepolia's Contract Address
  : "0x00000000219ab540356cBB839Cbe05303d7705Fa"; // ETH Address given in Task

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
    const transaction = await alchemy.core.getTransaction(txHash);
    logger.info(`Fetched transaction details for hash: ${txHash}`);
    console.log(transaction);
    return transaction;
  } catch (error) {
    logger.error(
      `Error fetching transaction details for hash ${txHash}: ${error.message}`
    );
  }
}

async function getTransactionDetailss(txHash) {
  try {
      const transactionReceipt = await alchemy.core.getTransactionReceipt(txHash);
      logger.info(`Fetched transaction details for hash: ${txHash}`);
      return transactionReceipt;
  } catch (error) {
      logger.error(`Error fetching transaction details for hash ${txHash}: ${error.message}`);
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

// Function to recover public key from transaction
async function recoverPublicKey(txHash) {
  try {
    const tx = await alchemy.core.getTransaction(txHash);
    if (!tx) {
      throw new Error(`Transaction not found: ${txHash}`);
    }

    const { r, s, v, data } = tx;
   
    // Convert data and signature components to Buffer
    const dataBuffer = Buffer.from(data.slice(2), "hex");
    const rBuffer = Buffer.from(r.slice(2), "hex");
    const sBuffer = Buffer.from(s.slice(2), "hex");
    const vValue = v === 0 ? 27 : v === 1 ? 28 : v;
    // Create the transaction data for hashing
    const msgHash = keccak256(dataBuffer);

    // Convert the signature components to Buffer
    const sigR = Buffer.from(r.slice(2), "hex");
    const sigS = Buffer.from(s.slice(2), "hex");
    const sigV = vValue;

    // Recover the public key
    const pb = ecrecover(msgHash, sigV, sigR, sigS);
    const publicKey = bufferToHex(pb);
  
    return publicKey;
  } catch (error) {
    logger.error(
      `Error recovering public key for hash ${txHash}: ${error.message}`
    );
  }
}

module.exports = {
  getDepositLogs,
  getTransactionDetails,
  getBlockTimestamp,
  recoverPublicKey,
  getTransactionDetailss
};
