const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("./config");
const solicitudes = require("./storage");

module.exports = async (interaction) => {

    // --- TIENDA ANTERIOR ---
    if (interaction.isStringSelectMenu() && interaction.customId === "shop_panel") {
        if (interaction.values[0] === "venta") {
            const modal = new ModalBuilder().setCustomId("venta_modal").setTitle("Venta de Objetos");
            const objeto = new TextInputBuilder().setCustomId("objeto").setLabel("¿Qué es lo que quieres vender?").setStyle(TextInputStyle.Paragraph).setRequired(true);
            const precio = new TextInputBuilder().setCustomId("precio").setLabel("¿Cuál es tu precio?").setStyle(TextInputStyle.Short).setRequired(true);
            const acuerdo = new TextInputBuilder().setCustomId("acuerdo").setLabel("¿Estás de acuerdo con lo mencionado?").setStyle(TextInputStyle.Short).setRequired(true);
            const metodoPago = new TextInputBuilder().setCustomId("metodoPago").setLabel("¿Qué método de pago prefieres recibir?").setStyle(TextInputStyle.Short).setPlaceholder("Ejemplo: Robux, PayPal, Banco...").setRequired(true);
            const cuestionar = new TextInputBuilder().setCustomId("cuestionar").setLabel("¿Cuestionarás al comprador?").setStyle(TextInputStyle.Short).setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(objeto),
                new ActionRowBuilder().addComponents(precio),
                new ActionRowBuilder().addComponents(acuerdo),
                new ActionRowBuilder().addComponents(metodoPago),
                new ActionRowBuilder().addComponents(cuestionar)
            );
            return await interaction.showModal(modal);
        }
    }

    if (interaction.isModalSubmit() && interaction.customId === "venta_modal") {
        const objeto = interaction.fields.getTextInputValue("objeto");
        const precio = interaction.fields.getTextInputValue("precio");
        const acuerdo = interaction.fields.getTextInputValue("acuerdo");
        const metodoPago = interaction.fields.getTextInputValue("metodoPago");
        const cuestionar = interaction.fields.getTextInputValue("cuestionar");

        solicitudes.set(interaction.user.id, {
            tipo: "tienda",
            usuario: interaction.user.id,
            objeto, precio, acuerdo, metodoPago, cuestionar, imagen: null
        });

        await interaction.reply({ content: "✅ Información recibida.\n\n📩 Te envié un mensaje privado para que envíes la imagen del objeto.", ephemeral: true });

        try {
            const dm = await interaction.user.createDM();
            await dm.send({ content: "📷 **Envíame ahora la imagen del objeto que quieres vender.**\n\nCuando la envíes, será enviada al equipo de revisión." });
        } catch(e) { console.log("No se pudo enviar DM:", e); }
        return;
    }


    // --- NUEVO SISTEMA DE BASES ---
    if (interaction.isStringSelectMenu() && interaction.customId === "base_panel") {
        const baseSeleccionada = interaction.values[0];

        const modal = new ModalBuilder().setCustomId(`base_modal_${baseSeleccionada}`).setTitle(`Solicitud: ${baseSeleccionada}`);
        const garantia = new TextInputBuilder().setCustomId("garantia").setLabel("1 • ¿Cuál es tu garantía?").setStyle(TextInputStyle.Paragraph).setRequired(true);
        const pago = new TextInputBuilder().setCustomId("pago").setLabel("2 • ¿Pago?").setStyle(TextInputStyle.Short).setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(garantia),
            new ActionRowBuilder().addComponents(pago)
        );
        return await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith("base_modal_")) {
        const baseNombre = interaction.customId.replace("base_modal_", "");
        const garantia = interaction.fields.getTextInputValue("garantia");
        const pago = interaction.fields.getTextInputValue("pago");

        solicitudes.set(interaction.user.id, {
            tipo: "base",
            usuario: interaction.user.id,
            base: baseNombre,
            garantia,
            pago
        });

        await interaction.reply({ content: "✅ Tu solicitud de base ha sido enviada a revisión.", ephemeral: true });

        const canalRevision = await interaction.client.channels.fetch(config.BASES_REVIEW_CHANNEL);
        if (!canalRevision) return;

        const roleId = config.BASES[baseNombre];

        const embed = new EmbedBuilder()
            .setColor("#8B5CF6")
            .setTitle(`📦 Solicitud - ${baseNombre}`)
            .setDescription(`👤 **Usuario:** <@${interaction.user.id}>\n⭐️ **Base:** ${baseNombre}\n\n🛡️ **Garantía:**\n${garantia}\n\n💰 **Pago:**\n${pago}`)
            .setTimestamp();

        const botones = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`aprobar_${interaction.user.id}`).setLabel("Aprobar").setEmoji("✅").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`rechazar_${interaction.user.id}`).setLabel("Rechazar").setEmoji("❌").setStyle(ButtonStyle.Danger)
        );

        await canalRevision.send({ content: `<@&${roleId}>`, embeds: [embed], components: [botones] });
    }
};
