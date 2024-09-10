const { MongoClient, ObjectId } = require("mongodb");
const {
  getDepositLogs,
  getTransactionDetails,
  getBlockTimestamp,
} = require("./ethDepositFetcher");
const TelegramBot = require("node-telegram-bot-api");
const logger = require("./logger");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "ethDepositTracker";
const collectionName = "deposits";
const lastBlockCollection = "lastfetchedblock";
const lastBlockDocumentId = "66e027fa44debcae874e4272";

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Function to fetch the last fetched block from MongoDB
async function getLastFetchedBlock() {
  try {
    const db = client.db(dbName);
    const collection = db.collection(lastBlockCollection);

    // Find the document using the stored ObjectId
    const result = await collection.findOne({
      _id: new ObjectId(lastBlockDocumentId),
    });
    if (result && result.lastBlock) {
      logger.info(`Last fetched block found: ${result.lastBlock}`);
      return result.lastBlock + 1; // Increment the block number by 1 to make sure it fetches the next block
    }
    logger.info("No last block found, defaulting to 0.");
    return 0;
  } catch (error) {
    logger.error(`Error fetching last fetched block: ${error.message}`);
    return 0;
  }
}

async function storeLastFetchedBlock(blockNumber) {
  try {
    const db = client.db(dbName);
    const collection = db.collection(lastBlockCollection);

    // Update the specific document using its ObjectId
    await collection.updateOne(
      { _id: new ObjectId(lastBlockDocumentId) },
      { $set: { lastBlock: blockNumber } } // Update the field
    );
    logger.info(`Last fetched block (${blockNumber}) saved.`);
  } catch (error) {
    logger.error(`Error storing last fetched block: ${error.message}`);
  }
}

// Function to store deposit details in MongoDB
async function storeDepositDetails(deposit) {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Insert deposit data in MongoDB
    await collection.insertOne(deposit);
    logger.info(`Deposit stored: ${JSON.stringify(deposit)}`);

    // Alert deposit data in Telegram
    const message = `New deposit detected!\n\nBlock Number: ${deposit.blockNumber}\nBlock Timestamp: ${deposit.blockTimestamp}\nFee: ${deposit.fee}\nHash: ${deposit.hash}\nPubKey: ${deposit.pubkey}`;
    await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
    logger.info(`Alert sent to Telegram: ${message}`);
  } catch (error) {
    logger.error(`Error storing deposit details: ${error.message}`);
  }
}

// core function
async function trackDeposits() {
  try {
    const lastFetchedBlock = await getLastFetchedBlock();
    logger.info(`Fetching from block ${lastFetchedBlock}`);

    const logs = await getDepositLogs(lastFetchedBlock);

    if (logs && logs.length > 0) {
      logger.info(`Found ${logs.length} new deposit logs.`);
      for (const log of logs) {
        // Extract necessary details
        const txHash = log.transactionHash;
        const receipt = await getTransactionDetails(txHash);
        const timestamp = await getBlockTimestamp(receipt.blockNumber);

        // Extract deposit details as per your requirement
        const depositDetails = {
          blockNumber: receipt.blockNumber,
          blockTimestamp: new Date(timestamp * 1000).toISOString(),
          fee: receipt.gasUsed ? receipt.gasUsed.toString() : "0", // Convert gas used to fee (as a placeholder)
          hash: txHash,
          pubkey: log.address, // Replace with the correct field if needed (log.address might not be pubkey)
        };
        await storeDepositDetails(depositDetails);

        // Update latest block number
        const latestBlockNumber = logs[logs.length - 1].blockNumber;
        await storeLastFetchedBlock(latestBlockNumber);
      }
    } else {
      logger.info("No new deposit logs found.");
    }
  } catch (error) {
    logger.error(`Error tracking deposits: ${error.message}`);
  }
}

async function startTracking() {
  try {
    await client.connect();
    logger.info("Connected to MongoDB, starting deposit tracking...");

    // Run the trackDeposits function immediately
    await trackDeposits();

    setInterval(async () => {
      logger.info("Running deposit tracker...");
      await trackDeposits();
    }, 60000); // 1 minute interval
  } catch (error) {
    logger.error(`Error starting tracking: ${error.message}`);
  }
}

startTracking();
