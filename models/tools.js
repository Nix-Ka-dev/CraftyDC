import mongoose from "mongoose";

const singleToolSchema = new mongoose.Schema({
  material: { type: String, required: true },
  durability: { type: Number, required: true }
}, { _id: false });

const toolsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  swords: { type: [singleToolSchema], default: [] },
  pickaxes: { type: [singleToolSchema], default: [] }
});

export default mongoose.models.Tools || mongoose.model("Tools", toolsSchema);
