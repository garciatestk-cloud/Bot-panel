const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

const config = require("./config");

module.exports = async (client) => {

    // 1. PANEL DE BASES
    try {
        const channelBases = await client.channels.fetch(config.BASES_PANEL_CHANNEL);

        if (channelBases) {
            const messages = await channelBases.messages.fetch({ limit: 10 });
            const oldPanelBases = messages.find(m => m.author.id === client.user.id);

            if (oldPanelBases) {
                await oldPanelBases.delete().catch(() => {});
            }

            const embedBases = new EmbedBuilder()
                .setColor("#a855f7")
                .setTitle("📑 PANEL DE BASES")
                .setDescription("Ingresar texto");

            const options = Object.keys(config.BASES).map(baseName => ({
                label: baseName,
                emoji: "⭐️",
                value: baseName
            }));

            const menuBases = new StringSelectMenuBuilder()
                .setCustomId("base_panel")
                .setPlaceholder("⭐️ Selecciona una opción")
                .addOptions(options);

            const rowBases = new ActionRowBuilder().addComponents(menuBases);

            await channelBases.send({
                embeds: [embedBases],
                components: [rowBases]
            });

            console.log("✅ Panel de Bases enviado a su canal.");
        } else {
            console.log("❌ No se encontró el canal del panel de bases.");
        }
    } catch (error) {
        console.error("Error cargando panel de bases:", error);
    }

};
