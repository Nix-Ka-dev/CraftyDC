import { sendAction } from "../utils/crafty.js";

export default {
    name: "action",
    description: "Execute a server action",
    // Permissions-Check direkt im Command-Objekt (optional, aber sauberer)
    default_member_permissions: "8", 
    async execute(interaction) {
        // Sicherstellen, dass nur Admins den Command nutzen können
        if (!interaction.memberPermissions.has("Administrator")) {
            return interaction.reply({ 
                content: "You don't have permission to use this command.", 
                ephemeral: true 
            });
        }

        const actionValue = interaction.options.getString("name");
        
        // Erstmal die Antwort "aufschieben", falls die API etwas länger braucht
        await interaction.deferReply({ ephemeral: true });

        const result = await sendAction(actionValue);

        if (result.status === "ok") {
            // Wir machen die Erfolgsmeldung etwas schöner
            return interaction.editReply({ 
                content: `Action **${actionValue.replace('_', ' ')}** was sent successfully to Crafty.` 
            });
        }

        // Fehlermeldung
        interaction.editReply({ 
            content: `❌ Failed to execute action: ${result.error || "Unknown error"}` 
        });
    }
};