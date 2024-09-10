import express from "express";
import path from "path";
import { Server as socketIO } from "socket.io";
import fetch from "node-fetch";
import { config } from "dotenv";

config();
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 5000;

// Start the express server with the appropriate routes for webhook and web requests
const app = express()
  .use(express.static(path.join(__dirname, "public")))
  .use(express.json())
  .post("/alchemyhook", (req, res) => {
    notificationReceived(req);
    res.status(200).end();
  })
  .get("/*", (req, res) => res.sendFile(path.join(__dirname, "index.html")))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

// Start the websocket server
const io = new socketIO(app);

// Listen for client connections/calls on the WebSocket server
io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("disconnect", () => console.log("Client disconnected"));
  socket.on("register address", (msg) => {
    // Send address to Alchemy to add to notification
    addAddress(msg);
  });
});

// Notification received from Alchemy from the webhook. Let the clients know.
function notificationReceived(req) {
  console.log("notification received!");
  io.emit("notification", JSON.stringify(req.body));
}
console.log(process.env.ALCHEMY_NOTIFY_AUTH_TOKEN);
// Add an address to a notification in Alchemy
async function addAddress(new_address) {
  console.log("adding address " + new_address);
  const body = {
    webhook_id: process.env.ALCHEMY_NOTIFY_WEBHOOK_ID,
    addresses_to_add: [new_address],
    addresses_to_remove: [],
  };
  try {
    const response = await fetch(
      "https://dashboard.alchemyapi.io/api/update-webhook-addresses",
      {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          "X-Alchemy-Token": process.env.ALCHEMY_NOTIFY_AUTH_TOKEN,
        },
      }
    );
    const json = await response.json();
    console.log(json);
  } catch (err) {
    console.error(err);
  }
}
