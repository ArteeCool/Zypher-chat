import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  participantsIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [
    {
      senderId: { type: mongoose.Schema.Types.Mixed, required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
