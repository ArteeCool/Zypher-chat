import express from "express";
import mongoose from "mongoose";
import Chat from "../scemas/chat.scema.ts";
import userScema from "../scemas/user.scema.ts";
import { authenticateToken } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = (await Chat.find({})).filter((chat) =>
      chat.participantsIds.includes(userId)
    );

    res.status(200).json({ ok: true, data: chats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Server error" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await userScema.find({});
    res.status(200).json({ ok: true, data: users });
  } catch (error) {
    res.status(500).json({ ok: false, msg: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { participantsIds } = req.body;
    const ObjectId = mongoose.Types.ObjectId;

    if (participantsIds.some((id) => !ObjectId.isValid(id))) {
      return res.status(400).json({
        ok: false,
        msg: "Each participantId must be a valid MongoDB ObjectId.",
      });
    }

    const newChat = new Chat({
      participantsIds,
      messages: [{ senderId: "app", text: "Start of the conversation" }],
    });

    await newChat.save();
    res.status(201).json({ ok: true, data: newChat });
  } catch (error) {
    console.error("Error in saving chat:", error);
    res.status(500).json({ ok: false, msg: error.message });
  }
});

router.put("/", async (req, res) => {
  try {
    const { id, senderId, text } = req.body;

    console.log("Received message with SenderId:", senderId);
    console.log("Received message Text:", text);

    if (!id || !senderId || !text) {
      return res.status(400).json({ ok: false, msg: "Missing fields" });
    }

    const chat = await Chat.findById(id);

    if (!chat)
      return res.status(404).json({ ok: false, msg: "Chat not found" });

    chat.messages.push({ senderId, text });

    await chat.save();

    res.status(200).json({ ok: true, data: chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Server error" });
  }
});

router.delete("/", async (req, res) => {
  const { id } = req.body;
  try {
    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ ok: false, msg: "Chat not found" });
    }
    await Chat.deleteOne({ _id: id });
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, msg: "Server error" });
  }
});

export default router;
