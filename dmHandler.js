const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType
} = require("discord.js");

const config = require("./config");
const solicitudes = require("./storage");


module.exports = async (message, client) => {


    // Solo mensajes privados
    if (message.channel.type !== ChannelType.DM) return;


    if (message.author.bot) return;


    const solicitud = solicitudes.get(
        message.author.id
    );


    if (!solicitud) return;


    // Verificar que sea imagen

    if (!message.attachments.size) {

        await message.reply(
            "❌ Debes enviar una imagen del objeto."
        );

        return;

    }


    const imagen = message.attachments.first();


    solicitud.imagen = imagen.url;



    const canalRevision = await client.channels.fetch(
        config.REVIEW_CHANNEL
    );



    const embed = new EmbedBuilder()

        .setColor("#8B5CF6")

        .setTitle("📦 Nueva solicitud de venta")

        .setDescription(
`👤 Usuario:
<@${solicitud.usuario}>

📦 Objeto:
${solicitud.objeto}

💰 Precio y metodo de pago:
${solicitud.precio}

✅ Acepta condiciones:
${solicitud.acuerdo}

❓ Cuestionará al comprador:
${solicitud.cuestionar}`
        )

        .setImage(imagen.url)

        .setTimestamp();



    const botones = new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()

                .setCustomId(
                    `aprobar_${solicitud.usuario}`
                )

                .setLabel("Aprobar")

                .setEmoji("✅")

                .setStyle(ButtonStyle.Success),


            new ButtonBuilder()

                .setCustomId(
                    `rechazar_${solicitud.usuario}`
                )

                .setLabel("Rechazar")

                .setEmoji("❌")

                .setStyle(ButtonStyle.Danger)

        );



    await canalRevision.send({

        content:
        `<@&${config.REVIEWER_ROLE_1}> <@&${config.REVIEWER_ROLE_2}>`,

        embeds:[embed],

        components:[botones]

    });



    solicitudes.delete(
        message.author.id
    );


    await message.reply(
        "✅ Tu solicitud fue enviada a revisión correctamente."
    );


};
