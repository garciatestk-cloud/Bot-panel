const {
    Client,
    GatewayIntentBits,
    Partials,
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");


const config = require("./config");
const interactionCreate = require("./interactionCreate");
const dmHandler = require("./dmHandler");
const buttonHandler = require("./buttonHandler");


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

        .setTitle("TIENDA UNIVERSAL")

        .setDescription(`# SHOP DE OBJETOS <💸>
Abrimos una tienda para compra de objetos:

**STEAL A BRAINROT, MURDER MISTERY, JAILBREAK, ADOPT ME, entre otros…**

# FORMAS DE PAGO:

**1.** <:Robux:1527435955814793427> Robux.

**2.** <:PayPal:1527435918196215888> Paypal.

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





// MENÚ, MODAL Y BOTONES

client.on(
    Events.InteractionCreate,
    async (interaction) => {


        try {


            await interactionCreate(interaction);


            await buttonHandler(interaction);



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





// IMAGEN RECIBIDA POR DM

client.on(
    "messageCreate",
    async (message) => {


        try {


            await dmHandler(
                message,
                client
            );


        } catch(error) {


            console.error(
                "Error en DM:",
                error
            );


        }


    }
);





client.login(config.TOKEN);
