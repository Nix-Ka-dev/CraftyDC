import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const DISCORD_BOT_TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const commands = [
  {
    name: "mine",
    description: "Mine an ore to make items and earn XP"
  },
  {
    name: "craft",
    description: "Craft a sword or pickaxe",
    options: [
      {
        name: "type",
        type: 3, // STRING
        description: "Choose sword or pickaxe",
        required: true,
        choices: [
          { name: "Sword", value: "sword" },
          { name: "Pickaxe", value: "pickaxe" }
        ]
      },
      {
        name: "material",
        type: 3, // STRING
        description: "Choose material (stone, iron, diamond)",
        required: true,
        choices: [
          { name: "Stone", value: "stone" },
          { name: "Iron", value: "iron" },
          { name: "Diamond", value: "diamond" }
        ]
      }
    ]
  },
  {
    name: "inventory",
    description: "View your ores, swords, and pickaxes"
  },
  {
    name: "sell",
    description: "Sell emeralds for XP"
  },
  {
    name: "level",
    description: "Check your current level and XP"
  },
  {
    name: "whitelist",
    description: "Add a player to the Minecraft whitelist",
    options: [
      {
        name: "name",
        type: 3, // STRING
        description: "Minecraft username",
        required: true
      }
    ]
  },
  {
    name: "op",
    description: "Make a player operator on Minecraft Server",
    default_member_permissions: 0x00000008,
    options: [
      {
        name: "name",
        type: 3,
        description: "Minecraft username",
        required: true
      }
    ]
  },
  {
    name: "serverstatus",
    description: "Shows the Minecraft server status"
  }
];

const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log("Slash commands registered successfully!");
  } catch (err) {
    console.error(err);
  }
})();
