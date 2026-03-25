import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect("mongodb://127.0.0.1:27017/discordbot")
  .then(() => {
    console.log("Connected!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
