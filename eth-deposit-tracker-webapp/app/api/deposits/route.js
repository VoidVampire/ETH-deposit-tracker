import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "ethDepositTracker";
const collectionName = "deposits";

export async function GET() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Fetch the latest deposits
    const deposits = await collection
      .find()
      .sort({ _id: -1 })
      .limit(3)
      .toArray();
    

    const latestDeposits = deposits.map((deposit) => ({
      blockNumber: deposit.blockNumber,
      blockTimestamp: deposit.blockTimestamp,
      fee: deposit.fee,
      hash: deposit.hash,
      pubKey: deposit.pubkey,
    }));
    console.log(latestDeposits);
    return NextResponse.json({ latestDeposits });
  } catch (error) {
    console.error("Error fetching deposits:", error);
    return NextResponse.error();
  } finally {
    await client.close();
  }
}
