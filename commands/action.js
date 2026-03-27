import { sendAction } from "../utils/crafty.js";

export default {
    name: "action",
    description: "Execute a server action",
    async execute(interaction) {
        if (!interaction.memberPermissions.has("Administrator")) {
            return interaction.reply({ content: "You don't have permission.", ephemeral: true });
        }

        const name = interaction.options.getString("name");
        const result = await sendAction(name);

        if (result.status === "ok") {
            return interaction.reply({ content: `Action executed successfully.`, ephemeral: true });
        }

        interaction.reply({ content: `Failed: ${result.error}`, ephemeral: true });
    }
};
