import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.ts";
import cors from "cors";
import auth from "./middleware/auth.ts";

// Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://zypher-w04z.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.options("*", cors());

// Start server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

mongoose.connect(
  `mongodb+srv://artemgawrilyuk:${process.env.MONGODB_PASSWORD}@cluster0.c6zcwiu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
);

app.use("/api/auth", authRoutes);

app.get("/api/protected", auth, (req, res) => {
  res.json({ msg: `Hello user ${req.user.id}` });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
