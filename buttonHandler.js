const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

const config = require("./config");
const solicitudes = require("./storage");


module.exports = async (interaction) => {


    if (interaction.isButton()) {


        // CERRAR TICKET

        if (interaction.customId === "cerrar_ticket") {

            const esStaff = interaction.member.roles.cache.has(config.STAFF_ROLE);
            const esCerrador = interaction.member.roles.cache.has(config.CLOSE_TICKET_ROLE);

            if (!esStaff && !esCerrador) {
                return interaction.reply({
                    content: "❌ Solo el personal autorizado puede cerrar tickets.",
                    ephemeral: true
                });
            }

            await interaction.reply({
                content: "🔒 Cerrando ticket...",
                ephemeral: true
            });

            setTimeout(async () => {
                await interaction.channel.delete().catch(() => {});
            }, 3000);

            return;

        }




        // RECHAZAR SOLICITUD

        if (interaction.customId.startsWith("rechazar_")) {

            const usuarioId = interaction.customId.split("_")[1];
            const solicitud = solicitudes.get(usuarioId);

            if (solicitud?.tipo === "base") {

                const roleId = config.BASES[solicitud.base];

                if (roleId && !interaction.member.roles.cache.has(roleId)) {
                    return interaction.reply({
                        content: `❌ Solo miembros con el rol <@&${roleId}> pueden interactuar con esta solicitud.`,
                        ephemeral: true
                    });
                }

            }

            const modal = new ModalBuilder()
                .setCustomId(`razon_rechazo_${usuarioId}`)
                .setTitle("Razón del rechazo");

            const razon = new TextInputBuilder()
                .setCustomId("razon")
                .setLabel("¿Por qué se rechazó la solicitud?")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(razon)
            );

            await interaction.showModal(modal);

            return;

        }




        // APROBAR SOLICITUD

        if (interaction.customId.startsWith("aprobar_")) {

            const usuarioId = interaction.customId.split("_")[1];
            const solicitud = solicitudes.get(usuarioId);

            let usuario;

            try {
                usuario = await interaction.guild.members.fetch(usuarioId);
            } catch (error) {
                return interaction.reply({
                    content: "❌ No se pudo encontrar al usuario en el servidor.",
                    ephemeral: true
                });
            }


            // CASO 1: SOLICITUD DE BASE

            if (solicitud?.tipo === "base") {

                const roleId = config.BASES[solicitud.base];

                if (roleId && !interaction.member.roles.cache.has(roleId)) {
                    return interaction.reply({
                        content: `❌ Solo los miembros con el rol de la **${solicitud.base}** pueden aceptar esta solicitud.`,
                        ephemeral: true
                    });
                }

                const categoria = interaction.guild.channels.cache.get(
                    config.BASES_TICKET_CATEGORY
                );

                if (!categoria) {
                    return interaction.reply({
                        content: "❌ No se encontró la categoría de tickets de bases.",
                        ephemeral: true
                    });
                }

                const baseFormateada = solicitud.base.toLowerCase().replace(/\s+/g, "-");

                const canal = await interaction.guild.channels.create({
                    name: `・⟦📑⟧・${baseFormateada}-${usuario.user.username}`,
                    type: ChannelType.GuildText,
                    parent: categoria.id,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: usuarioId,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        },
                        {
                            id: interaction.user.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        },
                        {
                            id: roleId,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        },
                        {
                            id: config.CLOSE_TICKET_ROLE,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        }
                    ]
                });

                const embed = new EmbedBuilder()
                    .setColor("#8B5CF6")
                    .setTitle(`📑 Solicitud Aceptada - ${solicitud.base}`)
                    .setDescription(
                        `Bienvenido <@${usuarioId}>.\n\n` +
                        `⭐️ **Base:** ${solicitud.base}\n` +
                        `🛡️ **Garantía:** ${solicitud.garantia}\n` +
                        `💰 **Pago:** ${solicitud.pago}\n\n` +
                        `Atendido por: <@${interaction.user.id}>`
                    )
                    .setTimestamp();

                const botonCerrar = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("cerrar_ticket")
                        .setLabel("Cerrar Ticket")
                        .setEmoji("🔒")
                        .setStyle(ButtonStyle.Danger)
                );

                await canal.send({
                    content: `<@${usuarioId}> <@&${roleId}>`,
                    embeds: [embed],
                    components: [botonCerrar]
                });

                await interaction.message.edit({ components: [] });

                await interaction.reply({
                    content: `✅ Ticket de base creado: ${canal}`,
                    ephemeral: true
                });

                return;

            }




            // CASO 2: SOLICITUD DE TIENDA ANTERIOR

            const categoriaTienda = interaction.guild.channels.cache.get(
                config.TICKET_CATEGORY
            );

            if (!categoriaTienda) {
                return interaction.reply({
                    content: "❌ No se encontró la categoría de tickets de la tienda.",
                    ephemeral: true
                });
            }

            const canalTienda = await interaction.guild.channels.create({
                name: `・⟦📑⟧・objeto-${usuario.user.username}`,
                type: ChannelType.GuildText,
                parent: categoriaTienda.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: usuarioId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    {
                        id: config.STAFF_ROLE,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    {
                        id: config.CLOSE_TICKET_ROLE,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    }
                ]
            });

            const embedTienda = new EmbedBuilder()
                .setColor("#8B5CF6")
                .setTitle("📑 Ticket de Objeto")
                .setDescription(
`Bienvenido <@${usuarioId}>.

📦 **Información de la solicitud**

📦 Objeto:
${solicitud?.objeto || "No registrado"}

💰 Precio:
${solicitud?.precio || "No registrado"}

💳 Método de pago:
${solicitud?.metodoPago || "No registrado"}

✅ Acepta condiciones:
${solicitud?.acuerdo || "No registrado"}

❓ Cuestionará al comprador:
${solicitud?.cuestionar || "No registrado"}


El comprador revisará tu ticket pronto.`
                )
                .setTimestamp();

            const botonCerrarTienda = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("cerrar_ticket")
                    .setLabel("Cerrar Ticket")
                    .setEmoji("🔒")
                    .setStyle(ButtonStyle.Danger)
            );

            await canalTienda.send({
                content: `<@${usuarioId}> <@&${config.STAFF_ROLE}>`,
                embeds: [embedTienda],
                components: [botonCerrarTienda]
            });

            await interaction.message.edit({ components: [] });

            await interaction.reply({
                content: `✅ Ticket creado: ${canalTienda}`,
                ephemeral: true
            });

            return;

        }




        // LEÍDO POSTULACIÓN MIDDLEMAN

        if (interaction.customId.startsWith("mm_leido_")) {

            const esStaff = interaction.member.roles.cache.has(config.STAFF_ROLE);

            if (!esStaff) {
                return interaction.reply({
                    content: "❌ Solo el personal autorizado puede marcar esto como leído.",
                    ephemeral: true
                });
            }

            const usuarioId = interaction.customId.split("_")[2];

            try {
                const usuario = await interaction.client.users.fetch(usuarioId);
                await usuario.send(
                    "📌 **¡Hola!** Te informamos que tu formulario de postulación para Middleman ya fue revisado por nuestro equipo. Los resultados oficiales se darán a conocer en un plazo de **1 a 3 días**. ¡Mucha suerte!"
                );
            } catch (error) {
                console.log("No se pudo enviar DM al usuario postulante.");
            }

            await interaction.message.edit({
                components: []
            });

            return await interaction.reply({
                content: `✅ Marcado como leído. Se le notificó por DM al usuario <@${usuarioId}>.`,
                ephemeral: true
            });

        }

    }




    // MODAL DE RECHAZO

    if (
        interaction.isModalSubmit() &&
        interaction.customId.startsWith("razon_rechazo_")
    ) {

        const usuarioId = interaction.customId.split("_")[2];
        const razon = interaction.fields.getTextInputValue("razon");

        await interaction.reply({
            content: "❌ Solicitud rechazada.",
            ephemeral: true
        });

        try {

            const usuario = await interaction.client.users.fetch(usuarioId);

            await usuario.send(
`❌ **Tu solicitud fue rechazada.**

📌 Razón:
${razon}`
            );

        } catch (error) {
            console.log("No se pudo enviar DM al usuario.");
        }

        await interaction.message.edit({ components: [] });

    }

};
