const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

const config = require("./config");
const solicitudes = require("./storage");


module.exports = async (interaction) => {


    // --- 1. SELECCIÓN DE BASE (MENÚ DESPLEGABLE) ---
    if (interaction.isStringSelectMenu() && interaction.customId === "base_panel") {

        const baseSeleccionada = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`solicitud_base_${baseSeleccionada}`)
            .setTitle(`Postulación - ${baseSeleccionada}`);

        const garantia = new TextInputBuilder()
            .setCustomId("garantia")
            .setLabel("¿Cuál es tu garantía?")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const pago = new TextInputBuilder()
            .setCustomId("pago")
            .setLabel("Método o cantidad de pago")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(garantia),
            new ActionRowBuilder().addComponents(pago)
        );

        return await interaction.showModal(modal);

    }




    // --- 2. ENVÍO DE SOLICITUD DE BASE ---
    if (
        interaction.isModalSubmit() &&
        interaction.customId.startsWith("solicitud_base_")
    ) {

        const base = interaction.customId.replace("solicitud_base_", "");
        const garantia = interaction.fields.getTextInputValue("garantia");
        const pago = interaction.fields.getTextInputValue("pago");

        solicitudes.set(interaction.user.id, {
            tipo: "base",
            base,
            garantia,
            pago
        });

        const canalRevision = interaction.guild.channels.cache.get(
            config.BASES_REVIEW_CHANNEL
        );

        if (!canalRevision) {
            return interaction.reply({
                content: "❌ No se encontró el canal de revisión de bases.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor("#a855f7")
            .setTitle(`⭐️ Nueva Solicitud de Base - ${base}`)
            .setDescription(
                `👤 **Usuario:** <@${interaction.user.id}>\n\n` +
                `🛡️ **Garantía:** ${garantia}\n` +
                `💰 **Pago:** ${pago}`
            )
            .setTimestamp();

        const roleId = config.BASES[base];

        const botones = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`aprobar_${interaction.user.id}`)
                .setLabel("Aceptar")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`rechazar_${interaction.user.id}`)
                .setLabel("Rechazar")
                .setEmoji("❌")
                .setStyle(ButtonStyle.Danger)
        );

        await canalRevision.send({
            content: roleId ? `<@&${roleId}>` : `<@&${config.STAFF_ROLE}>`,
            embeds: [embed],
            components: [botones]
        });

        return await interaction.reply({
            content: "✅ Tu solicitud de base ha sido enviada al equipo correspondiente.",
            ephemeral: true
        });

    }




    // --- 3. NUEVO SISTEMA MIDDLEMAN: ABRIR PARTE 1 (Preguntas 1 a 5) ---
    if (interaction.isButton() && interaction.customId === "abrir_formulario_mm") {

        const modal = new ModalBuilder()
            .setCustomId("modal_mm_parte1")
            .setTitle("Postulación Middleman (1/2)");

        const p1 = new TextInputBuilder()
            .setCustomId("p1")
            .setLabel("1. Rango y garantía deseada")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const p2 = new TextInputBuilder()
            .setCustomId("p2")
            .setLabel("2. ¿Consciente del límite de cobro?")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const p3 = new TextInputBuilder()
            .setCustomId("p3")
            .setLabel("3. Estafa con Brainrot (¿Qué harías?)")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const p4 = new TextInputBuilder()
            .setCustomId("p4")
            .setLabel("4. Normativa de No opinar")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const p5 = new TextInputBuilder()
            .setCustomId("p5")
            .setLabel("5. Atención Robux por Brainrots")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(p1),
            new ActionRowBuilder().addComponents(p2),
            new ActionRowBuilder().addComponents(p3),
            new ActionRowBuilder().addComponents(p4),
            new ActionRowBuilder().addComponents(p5)
        );

        return await interaction.showModal(modal);

    }




    // --- 4. RECIBIR PARTE 1 Y MOSTRAR MENÚ DESPLEGABLE PARA LA PARTE 2 ---
    if (interaction.isModalSubmit() && interaction.customId === "modal_mm_parte1") {

        const respuestasParciales = {
            p1: interaction.fields.getTextInputValue("p1"),
            p2: interaction.fields.getTextInputValue("p2"),
            p3: interaction.fields.getTextInputValue("p3"),
            p4: interaction.fields.getTextInputValue("p4"),
            p5: interaction.fields.getTextInputValue("p5")
        };

        solicitudes.set(`mm_temp_${interaction.user.id}`, respuestasParciales);

        const menuSiguiente = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("menu_mm_parte2")
                .setPlaceholder("Selecciona una opción para continuar")
                .addOptions([
                    {
                        label: "Continuar con la Parte 2",
                        description: "Haz clic aquí para responder las últimas preguntas",
                        value: "continuar_parte2",
                        emoji: "➡️"
                    }
                ])
        );

        return await interaction.reply({
            content: "✅ **¡Primera parte guardada con éxito!** Selecciona la opción en el menú de abajo para abrir las últimas preguntas.",
            components: [menuSiguiente],
            ephemeral: true
        });

    }




    // --- 5. ABRIR PARTE 2 MEDIANTE EL MENÚ DESPLEGABLE (Preguntas 6 a 10) ---
    if (interaction.isStringSelectMenu() && interaction.customId === "menu_mm_parte2") {

        if (interaction.values[0] === "continuar_parte2") {

            const temporal = solicitudes.get(`mm_temp_${interaction.user.id}`);
            if (!temporal) {
                return interaction.reply({
                    content: "❌ Tus respuestas anteriores expiraron. Por favor, vuelve a iniciar el formulario.",
                    ephemeral: true
                });
            }

            const modal = new ModalBuilder()
                .setCustomId("modal_mm_parte2")
                .setTitle("Postulación Middleman (2/2)");

            const p6 = new TextInputBuilder()
                .setCustomId("p6")
                .setLabel("6. Servidor de SAB (Obligatorio)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const p7 = new TextInputBuilder()
                .setCustomId("p7")
                .setLabel("7. Normativa de no retener brainrots")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const p8 = new TextInputBuilder()
                .setCustomId("p8")
                .setLabel("8. Experiencia previa como MM y lugar")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const p9 = new TextInputBuilder()
                .setCustomId("p9")
                .setLabel("9. Tradear SAB por otro juego (Ej: Adopt Me)")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const p10 = new TextInputBuilder()
                .setCustomId("p10")
                .setLabel("10. Entrega de brainrots con máquina")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(p6),
                new ActionRowBuilder().addComponents(p7),
                new ActionRowBuilder().addComponents(p8),
                new ActionRowBuilder().addComponents(p9),
                new ActionRowBuilder().addComponents(p10)
            );

            return await interaction.showModal(modal);

        }

    }




    // --- 6. PROCESAR Y ENVIAR LAS 10 PREGUNTAS AL CANAL DE REVISIÓN ---
    if (interaction.isModalSubmit() && interaction.customId === "modal_mm_parte2") {

        const parte1 = solicitudes.get(`mm_temp_${interaction.user.id}`);

        if (!parte1) {
            return interaction.reply({
                content: "❌ Hubo un error recuperando tus respuestas anteriores. Inténtalo de nuevo.",
                ephemeral: true
            });
        }

        const p6 = interaction.fields.getTextInputValue("p6");
        const p7 = interaction.fields.getTextInputValue("p7");
        const p8 = interaction.fields.getTextInputValue("p8");
        const p9 = interaction.fields.getTextInputValue("p9");
        const p10 = interaction.fields.getTextInputValue("p10");

        solicitudes.delete(`mm_temp_${interaction.user.id}`);

        // Cálculo de karma / aptitud
        let puntajeBase = 65;
        const textoTotal = `${parte1.p3} ${parte1.p4} ${p8}`.toLowerCase();
        if (textoTotal.length > 250) puntajeBase += 20;
        if (textoTotal.includes("si") || textoTotal.includes("de acuerdo") || textoTotal.includes("experiencia")) puntajeBase += 10;
        const porcentajeAptitud = Math.min(Math.max(puntajeBase, 50), 99);

        const canalRevision = await interaction.client.channels.fetch(
            config.MIDDLEMAN_REVIEW_CHANNEL
        );

        if (!canalRevision) {
            return interaction.reply({
                content: "❌ No se encontró el canal de revisión de Middleman.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor("#8B5CF6")
            .setTitle(`📋 Postulación Completa Middleman - ${interaction.user.tag}`)
            .setDescription(
`👤 **Postulante:** <@${interaction.user.id}> (\`${interaction.user.id}\`)
🤖 **Sistema de Karma (Aptitud Estimada):** \`${porcentajeAptitud}%\`

**1. Rango y garantía deseada:**
> ${parte1.p1}

**2. ¿Estás consciente de que no puedes cobrar más del límite admitido en el panel?:**
> ${parte1.p2}

**3. ¿Qué harías si alguno de los 2 miembros intenta estafar diciendo que ya te dio su Brainrot pero en realidad no te lo ha dado?:**
> ${parte1.p3}

**4. ¿Estás de acuerdo con la normativa estricta de No opinar durante la atención de un ticket / Tradeo? (⚠️ Si lo haces perderás el rol de Middleman):**
> ${parte1.p4}

**5. ¿Si alguien tradea robux por brainrots que debes hacer o cómo les brindarías la atención?:**
> ${parte1.p5}

**6. ¿Tienes servidor de Steal a Brainrot? (Obligatorio):**
> ${p6}

**7. ¿Estás de acuerdo con la normativa de no poder retener los brainrots de ambos usuarios? (⚠️ Hacer esto causará el retiro de tu rol):**
> ${p7}

**8. ¿Tienes experiencia previa como MiddleMan y si es así en donde?:**
> ${p8}

**9. ¿Si tradean SAB por otro juego (Ejem: Adopt me) como les brindarías atención?:**
> ${p9}

**10. ¿Estás de acuerdo con que la entrega de brainrots siempre debe ser con máquina? (⚠️ Es decir no puedes pedirle al usuario que ingrese a tu servidor):**
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
            content: "✅ **¡Formulario enviado con éxito!** Tu postulación completa ha sido enviada al equipo de revisión.",
            ephemeral: true
        });

    }

};
