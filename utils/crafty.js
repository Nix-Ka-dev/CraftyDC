import fetch from "node-fetch";
import https from "https";

const agent = new https.Agent({ rejectUnauthorized: false });

export async function whitelistPlayer(player) {
    return sendCommand(`whitelist reload\nwhitelist add ${player}\nwhitelist reload`);
}

export async function opPlayer(player) {
    return sendCommand(`op ${player}`);
}

async function sendCommand(command) {
    let data = { status: "error", error: "Unknown error" };

    try {
        const res = await fetch(`${process.env.CRAFTY_HOST}/api/v2/servers/${process.env.CRAFTY_SERVER_ID}/stdin`, {
            method: "POST",
            body: command,
            headers: {
                "Content-Type": "text/plain",
                "accept": "application/json",
                "Authorization": `Bearer ${process.env.CRAFTY_API_KEY}`
            },
            agent
        });

        try {
            data = await res.json();
        } catch {
            data.error = "Invalid JSON from Crafty";
        }
    } catch (err) {
        data.error = "Failed connecting to Crafty";
    }

    return data;
}
