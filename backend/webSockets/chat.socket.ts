import WebSocket from "ws";
import http from "http";
import { app } from "../server.ts";
import Chat from "../scemas/chat.scema.ts";

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("A user connected");

  ws.on("message", (message) => {
    console.log("Received:", message);
  });

  ws.on("close", () => {
    console.log("A user disconnected");
  });
});

const chatSocket = Chat.watch();

chatSocket.on("change", async (change) => {
  console.log("Change detected in Chat collection:", change);

  const updatedChats = await Chat.find().exec();

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(updatedChats));
    }
  });
});

export { wss, server };
