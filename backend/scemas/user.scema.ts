import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: { type: String, unique: true },
    password: String,
    confirmationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Number,
  },
  {
    collection: "Users",
  }
);

export default mongoose.model("User", userSchema);
