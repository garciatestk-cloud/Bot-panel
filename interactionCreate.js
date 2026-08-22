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


    // --- NUEVO SISTEMA DE POSTULACIÓN MIDDLEMAN (ABRIR MODAL PARTE 1) ---
    if (interaction.isButton() && interaction.customId === "abrir_formulario_mm") {
        const modal = new ModalBuilder()
            .setCustomId("modal_postulacion_mm_parte1")
            .setTitle("Postulación Middleman (1/2)");

        const p1 = new TextInputBuilder().setCustomId("p1").setLabel("1. Rango y garantía deseada").setStyle(TextInputStyle.Paragraph).setRequired(true);
        const p2 = new TextInputBuilder().setCustomId("p2").setLabel("2. Conciencia sobre límite de cobro").setStyle(TextInputStyle.Short).setRequired(true);
        const p3 = new TextInputBuilder().setCustomId("p3").setLabel("3. Estafa con Brainrot (¿Qué harías?)").setStyle(TextInputStyle.Paragraph).setRequired(true);
        const p4 = new TextInputBuilder().setCustomId("p4").setLabel("4. Normativa de No opinar").setStyle(TextInputStyle.Short).setRequired(true);
        const p5 = new TextInputBuilder().setCustomId("p5").setLabel("5. Atención Robux por Brainrots").setStyle(TextInputStyle.Paragraph).setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(p1),
            new ActionRowBuilder().addComponents(p2),
            new ActionRowBuilder().addComponents(p3),
            new ActionRowBuilder().addComponents(p4),
            new ActionRowBuilder().addComponents(p5)
        );

        return await interaction.showModal(modal);
    }

    // --- PROCESAR PARTE 1 Y ABRIR PARTE 2 ---
    if (interaction.isModalSubmit() && interaction.customId === "modal_postulacion_mm_parte1") {
        solicitudes.set(`mm_temp_${interaction.user.id}`, {
            p1: interaction.fields.getTextInputValue("p1"),
            p2: interaction.fields.getTextInputValue("p2"),
            p3: interaction.fields.getTextInputValue("p3"),
            p4: interaction.fields.getTextInputValue("p4"),
            p5: interaction.fields.getTextInputValue("p5")
        });

        const modal2 = new ModalBuilder()
            .setCustomId("modal_postulacion_mm_parte2")
            .setTitle("Postulación Middleman (2/2)");

        const p6 = new TextInputBuilder().setCustomId("p6").setLabel("6. Servidor de Steal a Brainrot").setStyle(TextInputStyle.Short).setRequired(true);
        const p7 = new TextInputBuilder().setCustomId("p7").setLabel("7. Normativa de no retener brainrots").setStyle(TextInputStyle.Short).setRequired(true);
        const p8 = new TextInputBuilder().setCustomId("p8").setLabel("8. Experiencia previa y dónde").setStyle(TextInputStyle.Paragraph).setRequired(true);
        const p9 = new TextInputBuilder().setCustomId("p9").setLabel("9. Tradear SAB por otro juego").setStyle(TextInputStyle.Paragraph).setRequired(true);
        const p10 = new TextInputBuilder().setCustomId("p10").setLabel("10. Entrega siempre con máquina").setStyle(TextInputStyle.Short).setRequired(true);

        modal2.addComponents(
            new ActionRowBuilder().addComponents(p6),
            new ActionRowBuilder().addComponents(p7),
            new ActionRowBuilder().addComponents(p8),
            new ActionRowBuilder().addComponents(p9),
            new ActionRowBuilder().addComponents(p10)
        );

        return await interaction.showModal(modal2);
    }

    // --- PROCESAR PARTE 2 Y ENVIAR A REVISIÓN CON KARMA ---
    if (interaction.isModalSubmit() && interaction.customId === "modal_postulacion_mm_parte2") {
        const datosParte1 = solicitudes.get(`mm_temp_${interaction.user.id}`) || {};
        const p6 = interaction.fields.getTextInputValue("p6");
        const p7 = interaction.fields.getTextInputValue("p7");
        const p8 = interaction.fields.getTextInputValue("p8");
        const p9 = interaction.fields.getTextInputValue("p9");
        const p10 = interaction.fields.getTextInputValue("p10");

        solicitudes.delete(`mm_temp_${interaction.user.id}`);

        // Algoritmo interno de karma / aptitud (1% a 100%)
        let puntajeBase = 60;
        const textoCompleto = Object.values({...datosParte1, p6, p7, p8, p9, p10}).join(" ").toLowerCase();
        if (textoCompleto.length > 300) puntajeBase += 20;
        if (textoCompleto.includes("si") || textoCompleto.includes("de acuerdo")) puntajeBase += 10;
        if (p8.length > 20 && !p8.includes("no")) puntajeBase += 10;
        const porcentajeAptitud = Math.min(Math.max(puntajeBase, 45), 98);

        const canalRevision = await interaction.client.channels.fetch(config.MIDDLEMAN_REVIEW_CHANNEL);
        if (!canalRevision) {
            return interaction.reply({ content: "❌ No se encontró el canal de revisión de postulaciones de Middleman.", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor("#8B5CF6")
            .setTitle(`📋 Postulación Middleman - ${interaction.user.tag}`)
            .setDescription(
`👤 **Postulante:** <@${interaction.user.id}> (\`${interaction.user.id}\`)
🤖 **Sistema de Karma (Aptitud Estimada):** \`${porcentajeAptitud}%\`

**1. Rango y garantía:**
> ${datosParte1.p1 || "N/A"}

**2. Límite de cobro:**
> ${datosParte1.p2 || "N/A"}

**3. Estafa con Brainrot:**
> ${datosParte1.p3 || "N/A"}

**4. Normativa de No opinar:**
> ${datosParte1.p4 || "N/A"}

**5. Robux por Brainrots:**
> ${datosParte1.p5 || "N/A"}

**6. Servidor Steal a Brainrot:**
> ${p6}

**7. No retener brainrots:**
> ${p7}

**8. Experiencia previa:**
> ${p8}

**9. SAB por otro juego:**
> ${p9}

**10. Entrega con máquina:**
> ${p10}`
            )
            .setTimestamp();

        const botonLeido = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`mm_leido_${interaction.user.id}`)
                .setLabel("Leído")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Success)
        );

        await canalRevision.send({
            content: `<@&${config.STAFF_ROLE}>`,
            embeds: [embed],
            components: [botonLeido]
        });

        return await interaction.reply({
            content: "✅ ¡Tu postulación ha sido enviada exitosamente a revisión!",
            ephemeral: true
        });
    }

};
