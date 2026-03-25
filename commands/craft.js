import Miner from "../models/miner.js";
import Tools from "../models/tools.js";
import { EmbedBuilder } from "discord.js";

const recipes = {
  sword: { stone: 2, iron: 2, diamond: 2 },
  pickaxe: { stone: 3, iron: 3, diamond: 3 }
};

const durabilities = { sword: 20, pickaxe: 25 };

export default {
  name: "craft",
  description: "Craft a sword or pickaxe",
  options: [
    { name: "type", type: 3, description: "Sword or Pickaxe", required: true,
      choices: [{ name: "Sword", value: "sword" }, { name: "Pickaxe", value: "pickaxe" }] },
    { name: "material", type: 3, description: "Material", required: true,
      choices: [{ name: "Stone", value: "stone" }, { name: "Iron", value: "iron" }, { name: "Diamond", value: "diamond" }] }
  ],

  async execute(interaction) {
    const allowedChannelId = "1446079976305721454"; // replace with your channel ID
    if (interaction.channel.id !== allowedChannelId) {
      return interaction.reply({
        content: "❌ You can only use this command in the designated vox-craft channel!",
        ephemeral: true
      });}
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    const type = interaction.options.getString("type");
    const material = interaction.options.getString("material");

    const miner = await Miner.findOne({ userId, guildId });
    if (!miner || (miner.inventory[material] || 0) < recipes[type][material]) {
      return interaction.reply({ content: `You don't have enough ${material} to craft a ${type}.`, ephemeral: true });
    }

    miner.inventory[material] -= recipes[type][material];
    await miner.save();

    let tools = await Tools.findOne({ userId, guildId });
    if (!tools) tools = await Tools.create({ userId, guildId, swords: [], pickaxes: [] });

    tools[type + "s"].push({ material, durability: durabilities[type] });
    await tools.save();

    const embed = new EmbedBuilder()
      .setTitle("Crafting Success!")
      .setDescription(`You crafted a **${material} ${type}** with **${durabilities[type]} durability**!`)
      .setColor(0x00ff00);

    interaction.reply({ embeds: [embed] });
  }
};
