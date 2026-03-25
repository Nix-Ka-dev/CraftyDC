import Miner from "../models/miner.js";
import Tools from "../models/tools.js";
import { EmbedBuilder } from "discord.js";

export default {
    name: "inventory",
    description: "Check your mined items and tools",

    async execute(interaction) {
        const allowedChannelId = "1446079976305721454"; // replace with your channel ID
    if (interaction.channel.id !== allowedChannelId) {
      return interaction.reply({
        content: "❌ You can only use this command in the designated vox-craft channel!",
        ephemeral: true
      });}
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const miner = await Miner.findOne({ userId, guildId });
        if (!miner) return interaction.reply({ content: "You haven't mined anything yet!", ephemeral: true });

        const tools = await Tools.findOne({ userId, guildId });

        const { stone, coal, iron, diamond, emerald } = miner.inventory;

        const swords = tools?.swords || [];
        const pickaxes = tools?.pickaxes || [];

        const formatTools = arr => arr.map(t => `${t.material} (${t.durability})`).join("\n") || "None";

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s Inventory`)
            .setColor(0x00ff00)
            .addFields(
                // Ores
                { name: "🪨 Stone", value: stone.toString(), inline: true },
                { name: "🔥 Coal", value: coal.toString(), inline: true },
                { name: "⛏️ Iron", value: iron.toString(), inline: true },
                { name: "💎 Diamond", value: diamond.toString(), inline: true },
                { name: "🟩 Emerald", value: emerald.toString(), inline: true },

                // Tools
                { name: "🗡️ Swords (Durability)", value: formatTools(swords), inline: true },
                { name: "⛏️ Pickaxes (Durability)", value: formatTools(pickaxes), inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
