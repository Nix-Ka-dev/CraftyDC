import Miner from "../models/miner.js";

function requiredXP(level) { 
  return Math.floor(50 * Math.pow(level, 1.5)); 
}

export default {
  name: "level",
  description: "Show your current level and XP",
  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    let miner = await Miner.findOne({ userId, guildId });
    if (!miner) {
      return interaction.reply({ content: "You haven't mined yet!", ephemeral: true });
    }

    const nextLevel = requiredXP(miner.level);

    await interaction.reply({
      content: `🧑‍🚀 ${interaction.user.username}, you are level **${miner.level}** with **${miner.xp}/${nextLevel} XP**.`,
      ephemeral: true
    });
  }
};
