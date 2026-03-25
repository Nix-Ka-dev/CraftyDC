import fetch from "node-fetch";
import https from "https";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";

export default {
    name: "serverstatus",
    description: "Shows status of the Minecraft server",

    async execute(interaction) {
        try {
            const agent = new https.Agent({ rejectUnauthorized: false });

            const res = await fetch(`${process.env.CRAFTY_HOST}/api/v2/servers/${process.env.CRAFTY_SERVER_ID}/stats`, {
                headers: { Authorization: `Bearer ${process.env.CRAFTY_API_KEY}` },
                agent
            });

            const response = await res.json();
            const data = response.data;

            const running = data.running;
            const online = data.online || 0;
            const max = data.max || 0;

            let uptimeStr = running && data.started ? formatUptime(data.started) : "Offline";

            const motd = data.desc?.replace(/§./g, "").trim() || "No MOTD";

            const embed = new EmbedBuilder()
                .setTitle(`MC Server Status: ${process.env.MINECRAFT_SERVER_IP}`)
                .setColor(running ? 0x00ff00 : 0xff0000)
                .addFields(
                    { name: "Status", value: running ? "🟢 Online" : "🔴 Offline", inline: true },
                    { name: "Players", value: `${online}/${max}`, inline: true },
                    { name: "Uptime", value: uptimeStr, inline: true },
                    { name: "Description", value: motd }
                )
                .setTimestamp();

            const files = [];
            if (data.icon) {
                const buffer = Buffer.from(data.icon, "base64");
                files.push(new AttachmentBuilder(buffer, { name: "icon.png" }));
                embed.setThumbnail("attachment://icon.png");
            }

            interaction.reply({ embeds: [embed], files, ephemeral: true });

        } catch (err) {
            interaction.reply({ content: "Failed to fetch server status.", ephemeral: true });
        }
    }
};

function formatUptime(startString) {
    const started = new Date(startString.replace(" ", "T"));
    const now = new Date();
    const ms = now - started;

    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000) % 24;
    const d = Math.floor(ms / 86400000);

    return `${d ? d + "d " : ""}${h ? h + "h " : ""}${m ? m + "m " : ""}${s}s`;
}
