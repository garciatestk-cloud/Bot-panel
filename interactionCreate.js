const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");


const solicitudes = require("./storage");


module.exports = async (interaction) => {


    // MENÚ DESPLEGABLE
    if (
        interaction.isStringSelectMenu() &&
        interaction.customId === "shop_panel"
    ) {


        if (interaction.values[0] === "venta") {


            const modal = new ModalBuilder()
                .setCustomId("venta_modal")
                .setTitle("Venta de Objetos");


            const objeto = new TextInputBuilder()
                .setCustomId("objeto")
                .setLabel("¿Qué es lo que quieres vender?")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);


            const precio = new TextInputBuilder()
                .setCustomId("precio")
                .setLabel("¿Cuál es tu precio?")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);


            const acuerdo = new TextInputBuilder()
                .setCustomId("acuerdo")
                .setLabel("¿Estás de acuerdo con lo mencionado?")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            

            const metodoPago = new TextInputBuilder()
                .setCustomId("metodoPago")
                .setLabel("¿Qué método de pago prefieres recibir?")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Ejemplo: Robux, PayPal, Banco...")
                .setRequired(true);


            const cuestionar = new TextInputBuilder()
                .setCustomId("cuestionar")
                .setLabel("¿Cuestionarás al comprador?")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);



            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(objeto),

                new ActionRowBuilder()
                    .addComponents(precio),

                new ActionRowBuilder()
                    .addComponents(acuerdo),

                new ActionRowBuilder()
                    .addComponents(metodoPago),

                new ActionRowBuilder()
                    .addComponents(cuestionar)

            );


            await interaction.showModal(modal);

        }

    }



    // RECIBIR MODAL
    if (
        interaction.isModalSubmit() &&
        interaction.customId === "venta_modal"
    ) {


        const objeto =
            interaction.fields.getTextInputValue("objeto");


        const precio =
            interaction.fields.getTextInputValue("precio");


        const acuerdo =
            interaction.fields.getTextInputValue("acuerdo");

        const metodoPago =
            interaction.fields.getTextInputValue("metodoPago");
        
        const cuestionar =
            interaction.fields.getTextInputValue("cuestionar");



        solicitudes.set(interaction.user.id, {

            usuario: interaction.user.id,

            objeto,

            precio,

            acuerdo,

            metodoPago,

            cuestionar,

            imagen: null

        });



        // RESPUESTA PRIVADA AL USUARIO

        await interaction.reply({

            content:
            "✅ Información recibida.\n\n" +
            "📩 Te envié un mensaje privado para que envíes la imagen del objeto.",

            ephemeral: true

        });



        // ENVIAR DM

        try {


            const dm = await interaction.user.createDM();



            await dm.send({

                content:
                "📷 **Envíame ahora la imagen del objeto que quieres vender.**\n\n" +
                "Cuando la envíes, será enviada al equipo de revisión."

            });


        } catch(error) {


            console.log(
                "❌ No se pudo enviar DM al usuario:",
                error
            );


        }


    }


};
