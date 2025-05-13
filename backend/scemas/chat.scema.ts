import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  name: String,
  participantsIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [
    {
      senderId: { type: mongoose.Schema.Types.Mixed, required: true },
      text: {
        type: String,
        required: function () {
          return this.type !== "image";
        },
      },
      image: {
        type: String,
        required: function () {
          return this.type === "image";
        },
      },
      timestamp: { type: Date, default: Date.now },
      type: { type: String, default: "text" },
    },
  ],
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
