import mongoose from "mongoose";
import Miner from "./models/miner.js";
import Tools from "./models/tools.js";
import dotenv from "dotenv";

dotenv.config();

async function clearDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Delete all miners and tools
    await Miner.deleteMany({});
    await Tools.deleteMany({});

    console.log("Miner and Tools collections cleared!");
    process.exit(0);
  } catch (err) {
    console.error("Error clearing database:", err);
    process.exit(1);
  }
}

clearDatabase();

