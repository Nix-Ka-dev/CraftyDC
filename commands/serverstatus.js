// commands/serverstatus.js
import fetch from "node-fetch";
import https from "https";

const agent = new https.Agent({ rejectUnauthorized: false });

export default {
  name: "serverstatus",
  description: "Shows status of the Minecraft server",
  
  async execute({ api, data }) {
    try {
      const res = await fetch(`${process.env.CRAFTY_HOST}/api/v2/servers/${process.env.CRAFTY_SERVER_ID}/stats`, {
        headers: { Authorization: `Bearer ${process.env.CRAFTY_API_KEY}` },
        agent
      });
      
      const response = await res.json();
      const server = response.data;

      const running = server.running;
      const online = server.online || 0;
      const max = server.max || 0;
      const uptimeStr = running && server.started ? formatUptime(server.started) : "Offline";
      const motd = server.desc?.replace(/§./g, "").trim() || "No MOTD";

      let content = `**MC Server Status:** ${process.env.MINECRAFT_SERVER_IP}\n`;
      content += `**Status:** ${running ? "🟢 Online" : "🔴 Offline"}\n`;
      content += `**Players:** ${online}/${max}\n`;
      content += `**Uptime:** ${uptimeStr}\n`;
      content += `**Description:** ${motd}`;

      const files = [];
      if (server.icon) {
        const buffer = Buffer.from(server.icon, "base64");
        files.push({ name: "icon.png", file: buffer }); // ✅ Fluxer-kompatibel
      }

      await api.channels.createMessage(data.channel_id, {
        content,
        files: files.length ? files : undefined,
        message_reference: { message_id: data.id }
      });

    } catch (err) {
      console.error("Error fetching server status:", err);
      await api.channels.createMessage(data.channel_id, { 
        content: "❌ Failed to fetch server status.",
        message_reference: { message_id: data.id }
      });
    }
  }
};
function formatUptime(startString) {
  const started = new Date(startString.replace(" ", "T") + "Z"); // UTC erzwingen
  const now = new Date();
  let diff = Math.floor((now - started) / 1000); // Differenz in Sekunden

  if (diff <= 0) return "0s"; // gerade gestartet

  const days = Math.floor(diff / 86400);
  diff -= days * 86400;

  const hours = Math.floor(diff / 3600);
  diff -= hours * 3600;

  const minutes = Math.floor(diff / 60);
  const seconds = diff - minutes * 60;

  let str = "";
  if (days > 0) str += `${days}d `;
  if (hours > 0) str += `${hours}h `;
  if (minutes > 0) str += `${minutes}m `;
  str += `${seconds}s`;

  return str.trim();
}