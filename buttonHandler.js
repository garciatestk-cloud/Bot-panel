const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const config = require("./config");
const solicitudes = require("./storage");

module.exports = async (interaction) => {
    if (interaction.isButton()) {

        // CERRAR TICKET (Sirve para ambos)
        if (interaction.customId === "cerrar_ticket") {
            if (!interaction.member.roles.cache.has(config.STAFF_ROLE)) {
                return interaction.reply({ content: "❌ Solo el equipo de soporte puede cerrar tickets.", ephemeral: true });
            }
            await interaction.reply({ content: "🔒 Cerrando ticket...", ephemeral: true });
            setTimeout(async () => { await interaction.channel.delete().catch(() => {}); }, 3000);
            return;
        }

        // RECHAZAR SOLICITUD
        if (interaction.customId.startsWith("rechazar_")) {
            const usuarioId = interaction.customId.split("_")[1];
            const solicitud = solicitudes.get(usuarioId);

            // Si es de Base, verificar rol especifico
            if (solicitud?.tipo === "base") {
                const roleId = config.BASES[solicitud.base];
                if (roleId && !interaction.member.roles.cache.has(roleId)) {
                    return interaction.reply({ content: `❌ Solo miembros con el rol <@&${roleId}> pueden interactuar.`, ephemeral: true });
                }
            }

            const modal = new ModalBuilder().setCustomId(`razon_rechazo_${usuarioId}`).setTitle("Razón del rechazo");
            const razon = new TextInputBuilder().setCustomId("razon").setLabel("¿Por qué se rechazó la solicitud?").setStyle(TextInputStyle.Paragraph).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(razon));
            await interaction.showModal(modal);
            return;
        }

        // APROBAR SOLICITUD
        if (interaction.customId.startsWith("aprobar_")) {
            const usuarioId = interaction.customId.split("_")[1];
            const solicitud = solicitudes.get(usuarioId);

            let usuario;
            try { usuario = await interaction.guild.members.fetch(usuarioId); }
            catch { return interaction.reply({ content: "❌ No se pudo encontrar al usuario en el servidor.", ephemeral: true }); }

            // LÓGICA DE APROBACIÓN PARA BASE
            if (solicitud?.tipo === "base") {
                const roleId = config.BASES[solicitud.base];
                if (roleId && !interaction.member.roles.cache.has(roleId)) {
                    return interaction.reply({ content: `❌ Solo los miembros con el rol de la **${solicitud.base}** pueden aceptar esta solicitud.`, ephemeral: true });
                }

                const categoria = interaction.guild.channels.cache.get(config.BASES_TICKET_CATEGORY);
                if (!categoria) return interaction.reply({ content: "❌ No se encontró la categoría de tickets de bases.", ephemeral: true });

                const baseFormateada = solicitud.base.toLowerCase().replace(/\s+/g, "-");
                const canal = await interaction.guild.channels.create({
                    name: `・⟦📑⟧・${baseFormateada}-${usuario.user.username}`,
                    type: ChannelType.GuildText,
                    parent: categoria.id,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                        { id: usuarioId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
                    ]
                });

                const embed = new EmbedBuilder().setColor("#8B5CF6").setTitle(`📑 Ticket de ${solicitud.base}`)
                    .setDescription(`Bienvenido <@${usuarioId}>.\n\n⭐️ **Base:** ${solicitud.base}\n🛡️ **Garantía:** ${solicitud.garantia}\n💰 **Pago:** ${solicitud.pago}\n\nAtendido por: <@${interaction.user.id}>`).setTimestamp();

                await canal.send({ content: `<@${usuarioId}> <@${interaction.user.id}>`, embeds: [embed], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("cerrar_ticket").setLabel("Cerrar Ticket").setEmoji("🔒").setStyle(ButtonStyle.Danger))] });
                await interaction.message.edit({ components: [] });
                await interaction.reply({ content: `✅ Ticket creado: ${canal}`, ephemeral: true });
                return;
            }

            // LÓGICA DE APROBACIÓN PARA TIENDA (ANTERIOR)
            const categoriaTienda = interaction.guild.channels.cache.get(config.TICKET_CATEGORY);
            if (!categoriaTienda) return interaction.reply({ content: "❌ No se encontró la categoría de tickets.", ephemeral: true });

            const canalTienda = await interaction.guild.channels.create({
                name: `・⟦📑⟧・venta-${usuario.user.username}`,
                type: ChannelType.GuildText,
                parent: categoriaTienda.id,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: usuarioId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                    { id: config.STAFF_ROLE, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
                ]
            });

            const embedTienda = new EmbedBuilder().setColor("#8B5CF6").setTitle("📑 Ticket de venta")
                .setDescription(`Bienvenido <@${usuarioId}>.\n\n📦 **Información de la solicitud**\n\n📦 Objeto:\n${solicitud?.objeto || "No registrado"}\n\n💰 Precio:\n${solicitud?.precio || "No registrado"}\n\n💳 Método de pago:\n${solicitud?.metodoPago || "No registrado"}\n\n✅ Acepta condiciones:\n${solicitud?.acuerdo || "No registrado"}\n\n❓ Cuestionará al comprador:\n${solicitud?.cuestionar || "No registrado"}\n\nEl comprador revisará tu ticket pronto.`).setTimestamp();

            await canalTienda.send({ content: `<@${usuarioId}> <@&${config.STAFF_ROLE}>`, embeds: [embedTienda], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("cerrar_ticket").setLabel("Cerrar Ticket").setEmoji("🔒").setStyle(ButtonStyle.Danger))] });
            await interaction.message.edit({ components: [] });
            await interaction.reply({ content: `✅ Ticket creado: ${canalTienda}`, ephemeral: true });
            return;
        }
    }

    // MODAL RECHAZO (Sirve para ambos)
    if (interaction.isModalSubmit() && interaction.customId.startsWith("razon_rechazo_")) {
        const usuarioId = interaction.customId.split("_")[2];
        const razon = interaction.fields.getTextInputValue("razon");
        await interaction.reply({ content: "❌ Solicitud rechazada.", ephemeral: true });

        try {
            const usuario = await interaction.client.users.fetch(usuarioId);
            await usuario.send(`❌ **Tu solicitud fue rechazada.**\n📌 Razón:\n${razon}`);
        } catch {}

        await interaction.message.edit({ components: [] });
    }
};
