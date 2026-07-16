const {
    Client,
    GatewayIntentBits,
    Partials,
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");


const config = require("./config");
const solicitudes = require("./storage");
const interactionCreate = require("./interactionCreate");


const client = new Client({

    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],

    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User
    ]

});



client.once(Events.ClientReady, async () => {


    console.clear();


    console.log("==============================");
    console.log(`✅ Conectado como ${client.user.tag}`);
    console.log("==============================");



    const channel = await client.channels.fetch(
        config.PANEL_CHANNEL
    );



    if (!channel) {

        console.log("❌ No se encontró el canal del panel");
        return;

    }



    const embed = new EmbedBuilder()

        .setColor("#8B5CF6")

        .setTitle("SHOP DE OBJETOS")

        .setDescription(`# SHOP DE OBJETOS <a:money:1258873876763508737>

Abrimos una tienda para compra de objetos:

**STEAL A BRAINROT, MURDER MISTERY, JAILBREAK, ADOPT ME, entre otros…**

# FORMAS DE PAGO:

**1.** <:Robux:1422204392777715814> Robux.

**2.** <:PayPal:1436114209241825492> Paypal.

**3.** Cualquier moneda internacional.

**4.** Bancos de América latina.

-# • BBVA.
-# • Grupo Santander.
-# • Bancolombia.
-# • Itau.
-# • Scotiabank.

# MÍNIMO DE COMPRA:

- Equivalente a 15 **USD**.
- 500 **ROBUX** en objetos.

Selecciona una opción del menú para comenzar.`)

        .setImage(config.PANEL_IMAGE);



    const menu = new StringSelectMenuBuilder()

        .setCustomId("shop_panel")

        .setPlaceholder("💸 Selecciona una opción")

        .addOptions([

            {

                label: "Venta de Objetos",

                description: "Vender un objeto",

                emoji: "<:Robux:1422204392777715814>",

                value: "venta"

            }

        ]);



    const row = new ActionRowBuilder()

        .addComponents(menu);



    const mensajes = await channel.messages.fetch({
        limit: 10
    });



    const existe = mensajes.find(

        msg =>

        msg.author.id === client.user.id &&

        msg.components.length > 0

    );



    if (!existe) {

        await channel.send({

            embeds: [embed],

            components: [row]

        });

    }


});




// INTERACCIONES (MENÚ Y MODAL)

client.on(
    Events.InteractionCreate,
    async (interaction) => {


        try {


            await interactionCreate(interaction);


        } catch(error) {


            console.error(error);



            if (
                interaction.replied ||
                interaction.deferred
            ) return;



            await interaction.reply({

                content:
                "❌ Ocurrió un error.",

                ephemeral:true

            });


        }


    }
);





// RECIBIR IMAGEN DEL OBJETO

client.on("messageCreate", async (message) => {


    if (message.author.bot) return;



    const solicitud = solicitudes.get(
        message.author.id
    );



    if (!solicitud) return;



    if (!message.attachments.size) return;



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

💰 Precio:
${solicitud.precio}

✅ Acepta condiciones:
${solicitud.acuerdo}

❓ Cuestionará al comprador:
${solicitud.cuestionar}`
        )

        .setImage(solicitud.imagen)

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
        "✅ Imagen recibida. Tu solicitud fue enviada a revisión."
    );


});





client.login(config.TOKEN);
