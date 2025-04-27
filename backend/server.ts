import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.ts";
import chatsRoutes from "./routes/chats.ts";
import cors from "cors";
import { authenticateToken } from "./middleware/auth.ts";
import Chat from "./scemas/chat.scema.ts";
import http from "http";
import { WebSocketServer } from "ws";
import { WebSocket } from "ws";

dotenv.config();
export const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const ioClients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  console.log("A user connected");
  ioClients.add(ws);

  ws.on("message", (message) => {
    console.log("Received:", message);
  });

  ws.on("close", () => {
    console.log("A user disconnected");
    ioClients.delete(ws);
  });
});

const chatSocket = Chat.watch();

chatSocket.on("change", async (change) => {
  console.log("Change detected in Chat collection:", change);
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
      "http://localhost:3000",
      "https://zypher-w04z.onrender.com",
      "https://dazzling-douhua-5ccf2f.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatsRoutes);

const connectDB = async () => {
  const result = await mongoose.connect(
    `mongodb+srv://artemgawrilyuk:${process.env.MONGODB_PASSWORD}@cluster0.c6zcwiu.mongodb.net/Zypher?retryWrites=true&w=majority&appName=Cluster0`
  );
};

connectDB();

app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ msg: `Hello user ${req.user.id}` });
});

server.listen(PORT, () => {
  console.log(`Server with WebSocket started on http://localhost:${PORT}`);
});
