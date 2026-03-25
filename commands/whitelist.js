import { whitelistPlayer } from "../utils/crafty.js";

export default {
    name: "whitelist",
    description: "Whitelist a Minecraft player",
    async execute(interaction) {
        const name = interaction.options.getString("name");
        const result = await whitelistPlayer(name);

        if (result.status === "ok") {
            return interaction.reply({ content: `Player **${name}** whitelisted!`, ephemeral: true });
        }

        interaction.reply({ content: `Failed: ${result.error}`, ephemeral: true });
    }
};
