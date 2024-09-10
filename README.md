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