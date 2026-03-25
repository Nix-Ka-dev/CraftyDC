import Miner from "../models/miner.js";
import Tools from "../models/tools.js";

const emoji = { stone: "🪨", coal: "🔥", iron: "⛏️", diamond: "💎", emerald: "🟩" };

export default {
  name: "inventory",
  description: "Check your mined items and tools",

  async execute({ api, data }) {
    const userId = data.author.id;
    const guildId = data.guild_id;

    const miner = await Miner.findOne({ userId, guildId });
    if (!miner) {
      return await api.channels.createMessage(data.channel_id, {
        content: "You haven't mined anything yet!",
        message_reference: { message_id: data.id }
      });
    }

    const tools = await Tools.findOne({ userId, guildId });

    const { stone = 0, coal = 0, iron = 0, diamond = 0, emerald = 0 } = miner.inventory;

    const swords = tools?.swords || [];
    const pickaxes = tools?.pickaxes || [];

    const formatTools = arr => arr.map(t => `${t.material} (${t.durability})`).join("\n") || "None";

    // Nachricht zusammenstellen
    let message = `**${data.author.username}'s Inventory**\n\n`;
    message += `🪨 Stone: ${stone}\n`;
    message += `🔥 Coal: ${coal}\n`;
    message += `⛏️ Iron: ${iron}\n`;
    message += `💎 Diamond: ${diamond}\n`;
    message += `🟩 Emerald: ${emerald}\n\n`;
    message += `🗡️ Swords (Durability):\n${formatTools(swords)}\n\n`;
    message += `⛏️ Pickaxes (Durability):\n${formatTools(pickaxes)}\n`;

    await api.channels.createMessage(data.channel_id, {
      content: message,
      message_reference: { message_id: data.id }
    });
  }
};