import { opPlayer } from "../utils/crafty.js";

export default {
    name: "op",
    description: "Make a player operator",
    async execute(interaction) {
        if (!interaction.memberPermissions.has("Administrator")) {
            return interaction.reply({ content: "You don't have permission.", ephemeral: true });
        }

        const name = interaction.options.getString("name");
        const result = await opPlayer(name);

        if (result.status === "ok") {
            return interaction.reply({ content: `Player **${name}** is OP now.`, ephemeral: true });
        }

        interaction.reply({ content: `Failed: ${result.error}`, ephemeral: true });
    }
};
