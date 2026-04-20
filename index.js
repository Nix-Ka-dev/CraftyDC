import { Client, GatewayIntentBits, ActivityType, Collection } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
dotenv.config();

// Create client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const voxCraftEnabled = process.env.ENABLE_VOX_CRAFT !== 'false';
if(voxCraftEnabled){
    mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB error:", err));
   
}
// Command handler
client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    client.commands.set(command.default.name, command.default);
}
const PresenceText = process.env.PRESENCE_TEXT || "Crafty API";
// Ready
client.on("ready", (c) => {
    console.log(`Bot logged in as ${c.user.tag}`);
    c.user.setPresence({
        status: "online",
        activities: [{ name: PresenceText, type: ActivityType.Watching }],
    });
});
const welcomeEnabled = process.env.ENABLE_WELCOME_MSG !== 'false';
const welcomeRoleEnabled = process.env.ENABLE_WELCOME_ROLE !== 'false';
const rawMsg = process.env.WELCOME_MSG || "👋 Hallooo {user}! \nWelcome!";

// 1. {user} durch das member-Objekt ersetzen
// 2. \\n (Text) durch \n (echten Umbruch) ersetzen
const finalMsg = rawMsg
    .replace("{user}", member) 
    .replace(/\\n/g, '\n');

client.on("guildMemberAdd", async (member) => {
    try {
        // 1. Willkommensnachricht (Optional)
        if (welcomeEnabled) {
            const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
            if (channel) {
                await channel.send(process.env.WELCOME_MSG || `👋 Heey ${member}! \nWelcome to the server!`);
            }
        }
        if (welcomeRoleEnabled){
            const role = member.guild.roles.cache.get(process.env.DEFAULT_ROLE_ID);
        if (role) {
            await member.roles.add(role);
        }   
        }
    } catch (err) {
        console.error("Error handling new member:", err);
    }
});


// Interaction handler
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        interaction.reply({ content: "Error executing command.", ephemeral: true });
    }
});

client.login(process.env.BOT_TOKEN);
