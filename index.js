import { Client, GatewayIntentBits, ActivityType, Collection } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
dotenv.config();

// Create client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB error:", err));

// Command handler
client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    client.commands.set(command.default.name, command.default);
}

// Ready
client.on("ready", (c) => {
    console.log(`Bot logged in as ${c.user.tag}`);
    c.user.setPresence({
        status: "online",
        activities: [{ name: "🗒️Documents of your Data🗒️", type: ActivityType.Watching }],
    });
});
client.on("guildMemberAdd", async (member) => {
    try {
        // Welcome message
        const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
        if (channel) {
            await channel.send(`👋 Hallooo ${member}! \nBitte lies den info channel da wichtiger stuff und so`);
        }

        // Assign default role
        const role = member.guild.roles.cache.get(process.env.DEFAULT_ROLE_ID);
        if (role) {
            await member.roles.add(role);
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
