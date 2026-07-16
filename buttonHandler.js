const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


const config = require("./config");
const solicitudes = require("./storage");


module.exports = async (interaction) => {


    if (!interaction.isButton()) return;



    // CERRAR TICKET

    if (
        interaction.customId === "cerrar_ticket"
    ) {


        await interaction.reply({

            content:
            "🔒 Cerrando ticket...",

            ephemeral:true

        });


        setTimeout(async () => {

            await interaction.channel.delete();

        }, 3000);


        return;

    }





    // RECHAZAR SOLICITUD

    if (
        interaction.customId.startsWith("rechazar_")
    ) {


        const usuarioId =
            interaction.customId.split("_")[1];


        await interaction.reply({

            content:
            "❌ Solicitud rechazada.",

            ephemeral:true

        });



        try {

            const usuario =
            await interaction.client.users.fetch(usuarioId);


            await usuario.send(
                "❌ Tu solicitud de venta fue rechazada por el equipo de revisión."
            );


        } catch(error) {

            console.log(
                "No se pudo enviar DM al usuario."
            );

        }



        await interaction.message.edit({

            components: []

        });


        return;

    }





    // APROBAR SOLICITUD

    if (
        interaction.customId.startsWith("aprobar_")
    ) {


        const usuarioId =
            interaction.customId.split("_")[1];


        const solicitud =
            solicitudes.get(usuarioId);



        let usuario;

        try {

            usuario =
            await interaction.guild.members.fetch(usuarioId);


        } catch(error) {


            return interaction.reply({

                content:
                "❌ No se pudo encontrar al usuario en el servidor.",

                ephemeral:true

            });

        }




        const categoria =
        interaction.guild.channels.cache.get(
            config.TICKET_CATEGORY
        );



        if (!categoria) {


            return interaction.reply({

                content:
                "❌ No se encontró la categoría de tickets.",

                ephemeral:true

            });

        }





        const canal =
        await interaction.guild.channels.create({


            name:
            `・⟦📑⟧・venta-${usuario.user.username}`,



            type:
            ChannelType.GuildText,



            parent:
            categoria.id,



            permissionOverwrites: [


                {

                    id:
                    interaction.guild.id,


                    deny:[

                        PermissionFlagsBits.ViewChannel

                    ]

                },



                {

                    id:
                    usuarioId,


                    allow:[

                        PermissionFlagsBits.ViewChannel,

                        PermissionFlagsBits.SendMessages,

                        PermissionFlagsBits.ReadMessageHistory

                    ]

                },



                {

                    id:
                    config.STAFF_ROLE,


                    allow:[

                        PermissionFlagsBits.ViewChannel,

                        PermissionFlagsBits.SendMessages,

                        PermissionFlagsBits.ReadMessageHistory

                    ]

                }


            ]

        });






        const embed = new EmbedBuilder()


        .setColor("#8B5CF6")


        .setTitle("📑 Ticket de venta")


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





        const botonCerrar =
        new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()

                .setCustomId(
                    "cerrar_ticket"
                )

                .setLabel(
                    "Cerrar Ticket"
                )

                .setEmoji("🔒")

                .setStyle(
                    ButtonStyle.Danger
                )

        );





        await canal.send({

            content:
            `<@${usuarioId}> <@&${config.STAFF_ROLE}>`,

            embeds:[embed],

            components:[
                botonCerrar
            ]

        });





        // QUITAR BOTONES DE LA REVISIÓN

        await interaction.message.edit({

            components: []

        });





        await interaction.reply({

            content:
            `✅ Ticket creado: ${canal}`,

            ephemeral:true

        });





        try {


            await usuario.send(

                `✅ Tu solicitud fue aprobada. Tu ticket fue creado en ${canal}`

            );


        } catch(error) {}



    }


};
