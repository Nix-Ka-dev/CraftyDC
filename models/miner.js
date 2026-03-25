import mongoose from "mongoose";

const minerSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  lastMine: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  inventory: {
    stone: { type: Number, default: 0 },
    coal: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    diamond: { type: Number, default: 0 },
    emerald: { type: Number, default: 0 }
  }
});

export default mongoose.models.Miner || mongoose.model("Miner", minerSchema);
