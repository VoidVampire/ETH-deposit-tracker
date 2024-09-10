# ETH-deposit-tracker

Hi, this is my Ethereum Deposit Tracker. The project uses Alchemy (Ethereum node) to monitor the Beacon Deposit Contract address for incoming ETH deposits. It records and stores details like deposit amount, sender address, and timestamp.

## Repository Structure
1. **eth-deposit-tracker-core**: Core logic for fetching Ethereum deposit data, storing it in MongoDB, logging via Winston, and sending alerts through Telegram.
2. **eth-deposit-tracker-webapp**: Optional web interface for viewing deposit data.
3. **websocket-server**: Optional WebSocket server for Alchemy Notify integration.

## Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/VoidVampire/ETH-deposit-tracker.git
   ```

2. Set up core operations:
   ```bash
   cd eth-deposit-tracker-core
   npm install
   ```

3. (Optional) Set up the web app:
   ```bash
   cd ..
   cd eth-deposit-tracker-webapp
   npm install
   ```

4. (Optional) Set up the WebSocket server:
   ```bash
   cd ..
   cd websocket-server
   npm install
   ```

## Core Features

- **MongoDB**: Used to store deposit data.
- **Winston**: Logging module for tracking events and errors.
- **Telegram**: Sends real-time alerts for new deposits.

## Public Key Recovery

The **public key recovery** function allows the retrieval of a sender’s public key from a given Ethereum transaction. By fetching the transaction details using Alchemy and utilizing the transaction's signature (`r`, `s`, and `v` components), the public key can be recovered through cryptographic methods. This process ensures the authenticity and identity of the sender.

Here’s how it works:
1. The function fetches the transaction data via `alchemy.core.getTransaction()`.
2. It then extracts the `r`, `s`, `v`, and `data` fields from the transaction.
3. The data and signature components are converted to a hash using `keccak256`.
4. Using the signature and message hash, the public key is recovered via `ecrecover`.
5. The recovered public key is returned and can be used for verification purposes.

## Gas Fee Calculation

The **gas fee calculation** feature calculates the total gas fee incurred during a transaction by fetching transaction details and using the gas price and gas used values. The gas fee is important to monitor as it represents the cost paid by the user to execute a transaction on the Ethereum network.

Here’s the calculation process:
1. Fetch the transaction details using `alchemy.core.getTransaction()` and the transaction receipt using `alchemy.core.getTransactionReceipt()`.
2. Extract the `gasPrice` and `gasUsed` values from the transaction and receipt.
3. Convert these values from hexadecimal to decimal using `BigNumber`.
4. Multiply the `gasPrice` by the `gasUsed` to get the total fee in Wei.
5. Convert the total fee from Wei to Ether for readability.
6. Output the total gas fee in Ether for the user, along with additional details like the timestamp and the recovered public key.

## Configuration

Create a `.env` file for **eth-deposit-tracker-core** with the following variables:
- `ALCHEMY_API_KEY`
- `MONGODB_URI`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

For the **web app**, create a `.env.local` file:
- `MONGODB_URI`

## Running the Project

1. For core operations:
   ```bash
   npm run dev
   ```
   The script fetches new Ethereum deposit details every 60 seconds, updates MongoDB, logs details with Winston, and sends alerts via Telegram.

2. For the web app (along with core):
   - Run the core and web app simultaneously.
   - Access the app at `http://localhost:3000`.

3. (Optional) To use Alchemy Notify, configure the WebSocket server and provide a working WebSocket URL.

![image](https://github.com/user-attachments/assets/23a4840b-0a19-4537-ac4b-31dfc77817be)