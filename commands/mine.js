import Miner from "../models/miner.js";
import Tools from "../models/tools.js";

const drops = [
  { item: "stone", chance: 50, xp: 1 },
  { item: "coal", chance: 30, xp: 2 },
  { item: "iron", chance: 15, xp: 5 },
  { item: "diamond", chance: 4, xp: 15 },
  { item: "emerald", chance: 1, xp: 0 }
];

const emoji = { stone: "🪨", coal: "🔥", iron: "⛏️", diamond: "💎", emerald: "🟩" };
const bonusMapping = { iron: "diamond", diamond: "emerald" };
const pickaxeDurabilityLoss = 1;

// XP + levels
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

// Role mapping
const levelRoles = [
  { minLevel: 1, roleName: "Novice" },
  { minLevel: 3, roleName: "Apprentice" },
  { minLevel: 5, roleName: "Miner" },
  { minLevel: 7, roleName: "Expert" },
  { minLevel: 10, roleName: "Master" },
  { minLevel: 15, roleName: "Legend" }
];

function getRoleForLevel(level) {
  let role = levelRoles[0].roleName;
  for (const r of levelRoles) {
    if (level >= r.minLevel) role = r.roleName;
  }
  return role;
}

export default {
  name: "mine",
  description: "Mine resources and gain XP & Discord roles",
  async execute(interaction) {
    const allowedChannelId = "1446079976305721454";
    if (interaction.channel.id !== allowedChannelId) {
      return interaction.reply({
        content: "❌ You can only use this command in the vox-craft channel!",
        ephemeral: true
      });
    }

    const userId = interaction.user.id;
    const guild = interaction.guild;

    let miner = await Miner.findOne({ userId, guildId: guild.id });
    if (!miner) {
      miner = await Miner.create({
        userId,
        guildId: guild.id,
        level: 1,
        xp: 0,
        lastMine: 0,
        inventory: {}
      });
    }

    let tools = await Tools.findOne({ userId, guildId: guild.id });
    if (!tools) {
      tools = await Tools.create({
        userId,
        guildId: guild.id,
        swords: [],
        pickaxes: []
      });
    }

    // Cooldown
    const cooldown = 3600 * 1000;
    if (Date.now() - miner.lastMine < cooldown) {
      const left = Math.ceil((cooldown - (Date.now() - miner.lastMine)) / 1000 / 60);
      return interaction.reply({
        content: `⏳ You can mine again in ${left} minutes.`,
        ephemeral: true
      });
    }

    miner.lastMine = Date.now();

    // Roll drop
    const roll = Math.random() * 100;
    let drop = "stone";
    let cumulative = 0;

    for (const d of drops) {
      cumulative += d.chance;
      if (roll <= cumulative) {
        drop = d.item;
        break;
      }
    }

    // PICKAXE LOGIC (bonus + durability)
    if (tools.pickaxes.length > 0) {
      const priority = { stone: 1, iron: 2, diamond: 3 };

      // choose best pickaxe
      const bestPickaxe = tools.pickaxes.reduce((a, b) =>
        priority[a.material] > priority[b.material] ? a : b
      );

      const index = tools.pickaxes.findIndex(p =>
  p.material === bestPickaxe.material &&
  p.durability === bestPickaxe.durability
);


      // BONUS DROP (only iron → diamond OR diamond → emerald)
      if (
        bonusMapping[drop] &&
        bestPickaxe.material === drop &&
        Math.random() < 0.5
      ) {
        drop = bonusMapping[drop];
      }

      // ALWAYS reduce durability
      tools.pickaxes[index].durability -= pickaxeDurabilityLoss;

      // delete if broken
      if (tools.pickaxes[index].durability <= 0) {
        tools.pickaxes.splice(index, 1);
      }

      await tools.save();
    }

    // Update inventory
    miner.inventory[drop] = (miner.inventory[drop] || 0) + 1;

    if (drop === "coal") {
      miner.inventory.stone = (miner.inventory.stone || 0) + 1;
    }

    // XP gain
    const xpGained = drops.find(d => d.item === drop).xp;
    const leveledUp = addXP(miner, xpGained);

    await miner.save();

    // Discord roles
    const member = await guild.members.fetch(userId);
    const newRoleName = getRoleForLevel(miner.level);
    const allRoles = levelRoles.map(r => r.roleName);

    for (const roleName of allRoles) {
      const role = guild.roles.cache.find(r => r.name === roleName);
      if (role && member.roles.cache.has(role.id) && role.name !== newRoleName) {
        await member.roles.remove(role);
      }
    }

    const newRole = guild.roles.cache.find(r => r.name === newRoleName);
    if (newRole && !member.roles.cache.has(newRole.id)) {
      await member.roles.add(newRole);
    }

    // Reply message
    let reply = `⛏️ You mined **1 ${emoji[drop]} ${drop}**`;
    if (drop === "coal") reply += ` and 1 ${emoji.stone} stone`;
    reply += ` and earned ${xpGained} XP!\n`;

    if (leveledUp) {
      reply += `🎉 You leveled up to **level ${miner.level}** and are now **${newRoleName}**!`;
    } else {
      reply += `Your current rank: **${newRoleName}** (Level ${miner.level})`;
    }

    interaction.reply({ content: reply });
  }
};
