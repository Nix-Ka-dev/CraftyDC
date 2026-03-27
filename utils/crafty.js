import fetch from "node-fetch";
import https from "https";

const agent = new https.Agent({ rejectUnauthorized: false });

export async function whitelistPlayer(player) {
    return sendCommand(`whitelist reload\nwhitelist add ${player}\nwhitelist reload`);
}

export async function opPlayer(player) {
    return sendCommand(`op ${player}`);
}
export async function sendAction(action) { 
    let data = { status: "error", error: "Unknown error" };
    
    try {
        const res = await fetch(`${process.env.CRAFTY_HOST}/api/v2/servers/${process.env.CRAFTY_SERVER_ID}/action/${action}`, {
            method: "POST",
            headers: {
                "accept": "application/json",
                "Authorization": `Bearer ${process.env.CRAFTY_API_KEY}`,
                "Content-Type": "application/json" 
            },
            agent
        });

        if (!res.ok) {
            data.error = `HTTP Error: ${res.status}`;
            return data;
        }

        try {
            data = await res.json();
        } catch {
            data.error = "Invalid JSON from Crafty";
        }
    } catch (err) {
        data.error = "Failed connecting to Crafty";
        console.error(err);
    }
    
    return data; // Vergiss nicht, die Daten zurückzugeben!
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
