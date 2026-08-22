const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const config = require("./config");


module.exports = async (client) => {

    // 1. PANEL DE BASES
    try {

        const channelBases = await client.channels.fetch(
            config.BASES_PANEL_CHANNEL
        );

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
                label: `⭐️ ${baseName}`,
                value: baseName
            }));

            const menuBases = new StringSelectMenuBuilder()
                .setCustomId("base_panel")
                .setPlaceholder("Selecciona una opción")
                .addOptions(options);

            const rowBases = new ActionRowBuilder()
                .addComponents(menuBases);

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


    // 2. PANEL DE POSTULACIÓN MIDDLEMAN
    try {

        const channelMM = await client.channels.fetch(
            config.MIDDLEMAN_PANEL_CHANNEL
        );

        if (channelMM) {

            const messages = await channelMM.messages.fetch({ limit: 10 });

            const oldPanelMM = messages.find(m => m.author.id === client.user.id);

            if (oldPanelMM) {
                await oldPanelMM.delete().catch(() => {});
            }

            const embedMM = new EmbedBuilder()
                .setColor("#8B5CF6")
                .setTitle("📝 Postulación para Intermediario")
                .setDescription("Aplicar postulación para intermediario, interactúa con el panel para que tu solicitud sea enviada a revisión")
                .setImage("https://cdn.discordapp.com/attachments/1426388948963299523/1540742071395295402/IMG_3091.jpg?ex=6a8b0f5f&is=6a89bddf&hm=75e41c11aaadbff00a7f13ec6de5585bef93b6998b2557be5e90f7bdb7ceedc0&");

            const botonAbrir = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("abrir_formulario_mm")
                    .setLabel("Abrir formulario")
                    .setEmoji("📩")
                    .setStyle(ButtonStyle.Secondary)
            );

            await channelMM.send({
                embeds: [embedMM],
                components: [botonAbrir]
            });

            console.log("✅ Panel de Postulación Middleman enviado a su canal.");

        } else {
            console.log("❌ No se encontró el canal del panel de Middleman.");
        }

    } catch (error) {
        console.error("Error cargando panel de Middleman:", error);
    }

};
