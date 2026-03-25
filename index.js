import { Client, GatewayDispatchEvents } from '@discordjs/core';
import { REST } from '@discordjs/rest';
import { WebSocketManager } from '@discordjs/ws';
import dotenv from 'dotenv';
import fs from 'fs';
import mongoose from 'mongoose';
dotenv.config();

const token = process.env.BOT_TOKEN;
if (!token) throw new Error('You forgot the Fluxer bot token!');
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) throw new Error('You forgot the MONGO_URI!');

const PREFIX = "!";

// --- Bot starten NUR wenn DB verbunden ist ---
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');
  startBot();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// --- Bot-Startfunktion ---
async function startBot() {
  const rest = new REST({ api: 'https://api.fluxer.app', version: '1' }).setToken(token);
  const gateway = new WebSocketManager({ intents: 0, rest, token, version: '1' });
  const client = new Client({ rest, gateway });

  // --- Commands laden ---
  client.commands = new Map();
  const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    client.commands.set(command.default.name, command.default);
  }

  // --- Ready Event ---
  client.on(GatewayDispatchEvents.Ready, ({ data }) => {
    console.log(`Logged in as @${data.user.username}#${data.user.discriminator}`);
  });

  // --- Message Event ---
  client.on(GatewayDispatchEvents.MessageCreate, async ({ api, data }) => {
    if (data.author.bot || !data.content.startsWith(PREFIX)) return;

    const args = data.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) {
      return api.channels.createMessage(data.channel_id, {
        content: `Unbekannter Command: \`${commandName}\`. Tippe \`!help\` für die Liste der Commands.`,
        message_reference: { message_id: data.id }
      });
    }

    try {
      await command.execute({ api, data, args, client });
    } catch (err) {
      console.error("Error executing command:", err);
      await api.channels.createMessage(data.channel_id, { 
        content: "❌ Fehler beim Ausführen des Befehls!", 
        message_reference: { message_id: data.id } 
      });
    }
  });

  // --- Gateway starten ---
  gateway.connect();
}