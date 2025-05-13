import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.ts";
import chatsRoutes from "./routes/chats.ts";
import cors from "cors";
import { authenticateToken } from "./middleware/auth.ts";
import Chat from "./scemas/chat.scema.ts";
import https from "https";
import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import fs from "fs";

dotenv.config();
export const app = express();
const PORT = Number(process.env.PORT) || 5000;

const options = {
  key: fs.readFileSync("./backend/ssl/privkey.pem"),
  cert: fs.readFileSync("./backend/ssl/fullchain.pem"),
};

const server = https.createServer(options, app);

const wss = new WebSocketServer({ server });

const ioClients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  console.log("A user connected");
  ioClients.add(ws);

  ws.on("close", () => {
    console.log("A user disconnected");
    ioClients.delete(ws);
  });
});

const chatSocket = Chat.watch();

chatSocket.on("change", async (change) => {
  const updatedChats = await Chat.find().exec();

  ioClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(updatedChats));
    }
  });
});

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://arteecool.com.ua",
      "http://localhost:3000",
      "http://26.151.185.100:3000",
      "https://dazzling-douhua-5ccf2f.netlify.app",
      "https://109.95.33.158:5678/",
      "http://109.95.33.158:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatsRoutes);

app.get("/api/healthcheck", (req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/", authenticateToken, (req, res) => {
  res.redirect("https://arteecool.com.ua/");
});

const connectDB = async () => {
  const result = await mongoose.connect(
    `mongodb+srv://artemgawrilyuk:${process.env.MONGODB_PASSWORD}@cluster0.c6zcwiu.mongodb.net/Zypher?retryWrites=true&w=majority&appName=Cluster0`
  );
};

connectDB();

app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ msg: `Hello user ${req.user.id}` });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});
