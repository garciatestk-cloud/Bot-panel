const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");


const config = require("./config");


module.exports = async (interaction) => {


    if (!interaction.isButton()) return;



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

Un miembro del equipo atenderá tu venta.

Por favor proporciona la información necesaria.`

        )


        .setTimestamp();





        await canal.send({

            content:
            `<@${usuarioId}> <@&${config.STAFF_ROLE}>`,

            embeds:[embed]

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
