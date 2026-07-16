const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");


module.exports = async (interaction) => {


    // Detectar el menú del panel
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
                .setPlaceholder("Escribe el objeto y detalles...")
                .setRequired(true);


            const precio = new TextInputBuilder()
                .setCustomId("precio")
                .setLabel("¿Cuál es tu precio?")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Ejemplo: 15 USD / 500 Robux")
                .setRequired(true);


            const acuerdo = new TextInputBuilder()
                .setCustomId("acuerdo")
                .setLabel("¿Estás de acuerdo con lo mencionado?")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Sí / No")
                .setRequired(true);


            const cuestionar = new TextInputBuilder()
                .setCustomId("cuestionar")
                .setLabel("¿Cuestionarás al comprador?")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Sí / No")
                .setRequired(true);



            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(objeto),

                new ActionRowBuilder()
                    .addComponents(precio),

                new ActionRowBuilder()
                    .addComponents(acuerdo),

                new ActionRowBuilder()
                    .addComponents(cuestionar)

            );


            await interaction.showModal(modal);

        }

    }


};
