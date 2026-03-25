// commands/mine.js
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

function requiredXP(level) { return Math.floor(50 * Math.pow(level, 1.5)); }
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
  name: "mine",
  description: "Mine resources and gain XP & inventory",
  async execute({ api, data }) {
    const userId = data.author.id;
    const guildId = data.guild_id;

    let miner = await Miner.findOne({ userId, guildId });
    if (!miner) miner = await Miner.create({ userId, guildId, level: 1, xp: 0, lastMine: 0, inventory: {} });

    let tools = await Tools.findOne({ userId, guildId });
    if (!tools) tools = await Tools.create({ userId, guildId, swords: [], pickaxes: [] });

    // Cooldown
    const cooldown = 3600 * 1000;
    if (Date.now() - miner.lastMine < cooldown) {
      const left = Math.ceil((cooldown - (Date.now() - miner.lastMine)) / 1000 / 60);
      return await api.channels.createMessage(data.channel_id, { content: `⏳ You can mine again in ${left} minutes.`, message_reference: { message_id: data.id } });
    }
    miner.lastMine = Date.now();

    // Roll drop
    const roll = Math.random() * 100;
    let drop = "stone", cumulative = 0;
    for (const d of drops) {
      cumulative += d.chance;
      if (roll <= cumulative) { drop = d.item; break; }
    }

    // Pickaxe logic
    if (tools.pickaxes.length > 0) {
      const priority = { stone: 1, iron: 2, diamond: 3 };
      const bestPickaxe = tools.pickaxes.reduce((a, b) => priority[a.material] > priority[b.material] ? a : b);
      const index = tools.pickaxes.findIndex(p => p.material === bestPickaxe.material && p.durability === bestPickaxe.durability);
      if (bonusMapping[drop] && bestPickaxe.material === drop && Math.random() < 0.5) drop = bonusMapping[drop];
      tools.pickaxes[index].durability -= pickaxeDurabilityLoss;
      if (tools.pickaxes[index].durability <= 0) tools.pickaxes.splice(index, 1);
      await tools.save();
    }

    // Update inventory
    miner.inventory[drop] = (miner.inventory[drop] || 0) + 1;
    if (drop === "coal") miner.inventory.stone = (miner.inventory.stone || 0) + 1;

    const xpGained = drops.find(d => d.item === drop).xp;
    const leveledUp = addXP(miner, xpGained);
    await miner.save();

    let reply = `⛏️ You mined **1 ${emoji[drop]} ${drop}**`;
    if (drop === "coal") reply += ` and 1 ${emoji.stone} stone`;
    reply += ` and earned ${xpGained} XP!\n`;
    if (leveledUp) reply += `🎉 You leveled up to **level ${miner.level}**!`;
    else reply += `Your current level: **${miner.level}**`;

    await api.channels.createMessage(data.channel_id, { content: reply, message_reference: { message_id: data.id } });
  }
};