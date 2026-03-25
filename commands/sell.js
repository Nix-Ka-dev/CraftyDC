import Miner from "../models/miner.js";

function requiredXP(level) { 
  return Math.floor(50 * Math.pow(level, 1.5)); 
}

function addXP(miner, amount) {
  miner.xp += amount;
  let leveledUp = false;
  while (miner.xp >= requiredXP(miner.level)) {
    miner.xp -= requiredXP(miner.level);
    miner.level++;
    leveledUp = true;
  }
  return leveledUp;
}

export default {
  name: "sell",
  description: "Sell emeralds for 100 XP each",
  async execute(interaction) {
    const allowedChannelId = "1446079976305721454"; // replace with your channel ID
    if (interaction.channel.id !== allowedChannelId) {
      return interaction.reply({
        content: "❌ You can only use this command in the designated vox-craft channel!",
        ephemeral: true
      });}
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    let miner = await Miner.findOne({ userId, guildId });
    if (!miner) 
      return interaction.reply({ content: "You have no emeralds to sell.", ephemeral: true });

    const emeralds = miner.inventory.emerald || 0;
    if (emeralds === 0) 
      return interaction.reply({ content: "You have no emeralds to sell.", ephemeral: true });

    // Each emerald gives 100 XP
    const xpFromEmeralds = emeralds * 100;
    miner.inventory.emerald = 0;

    const leveledUp = addXP(miner, xpFromEmeralds);
    await miner.save();

    let reply = `💰 You sold ${emeralds} emerald(s) for ${xpFromEmeralds} XP!`;
    if (leveledUp) reply += `\n🎉 You leveled up to level ${miner.level}!`;

    interaction.reply({ content: reply });
  }
};
