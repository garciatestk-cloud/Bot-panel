const {
    Client,
    GatewayIntentBits,
    Partials,
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const config = require("./config");
const interactionCreate = require("./interactionCreate");
const dmHandler = require("./dmHandler");
const buttonHandler = require("./buttonHandler");
const readyHandler = require("./ready");


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

    console.log("========================================");
    console.log(`✅ Conectado como ${client.user.tag}`);
    console.log("========================================");

    // REGISTRAR COMANDO DE BARRA /setpanel EN EL BOT
    try {

        const setpanelCommand = new SlashCommandBuilder()
            .setName("setpanel")
            .setDescription("Personaliza el panel de bases con título, descripción e imagen.")
            .addStringOption(option =>
                option
                    .setName("titulo")
                    .setDescription("El título del embed")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName("descripcion")
                    .setDescription("La descripción del embed")
                    .setRequired(true)
            )
            .addAttachmentOption(option =>
                option
                    .setName("imagen")
                    .setDescription("Sube una imagen para el panel (Opcional)")
                    .setRequired(false)
            )
            .addStringOption(option =>
                option
                    .setName("url_imagen")
                    .setDescription("O pega un enlace/URL de imagen (Opcional)")
                    .setRequired(false)
            );

        await client.application.commands.create(setpanelCommand);
        console.log("✅ Comando /setpanel registrado con éxito.");

    } catch (error) {
        console.error("Error al registrar comando Slash:", error);
    }

    await readyHandler(client);

});


client.on(Events.InteractionCreate, async (interaction) => {

    try {

        // MANEJO DEL COMANDO SLASH /setpanel
        if (interaction.isChatInputCommand()) {

            if (interaction.commandName === "setpanel") {

                if (!interaction.member.roles.cache.has(config.STAFF_ROLE)) {
                    return interaction.reply({
                        content: "❌ Solo el equipo de Staff puede usar este comando.",
                        ephemeral: true
                    });
                }

                const titulo = interaction.options.getString("titulo");
                const descripcion = interaction.options.getString("descripcion");
                const imagenAdjunta = interaction.options.getAttachment("imagen");
                const urlImagen = interaction.options.getString("url_imagen");

                const imagenFinal = imagenAdjunta ? imagenAdjunta.url : (urlImagen || null);

                const embed = new EmbedBuilder()
                    .setColor("#a855f7")
                    .setTitle(titulo)
                    .setDescription(descripcion);

                if (imagenFinal) {
                    embed.setImage(imagenFinal);
                }

                const options = Object.keys(config.BASES).map(baseName => ({
                    label: `⭐️ ${baseName}`,
                    value: baseName
                }));

                const menu = new StringSelectMenuBuilder()
                    .setCustomId("base_panel")
                    .setPlaceholder("Selecciona una opción")
                    .addOptions(options);

                const row = new ActionRowBuilder().addComponents(menu);

                const canalBases = await client.channels.fetch(config.BASES_PANEL_CHANNEL);

                if (canalBases) {

                    const messages = await canalBases.messages.fetch({ limit: 10 });
                    const oldPanel = messages.find(m => m.author.id === client.user.id);

                    if (oldPanel) {
                        await oldPanel.delete().catch(() => {});
                    }

                    await canalBases.send({
                        embeds: [embed],
                        components: [row]
                    });

                    return interaction.reply({
                        content: "✅ Panel de Bases actualizado correctamente en el canal.",
                        ephemeral: true
                    });

                } else {
                    return interaction.reply({
                        content: "❌ No se pudo encontrar el canal del panel de bases.",
                        ephemeral: true
                    });
                }

            }

        }

        await interactionCreate(interaction);
        await buttonHandler(interaction);

    } catch (error) {

        console.error("Error en interactionCreate:", error);

        if (interaction.replied || interaction.deferred) return;

        await interaction.reply({
            content: "❌ Ocurrió un error al procesar la interacción.",
            ephemeral: true
        });

    }

});


client.on(Events.MessageCreate, async (message) => {

    try {
        await dmHandler(message, client);
    } catch (error) {
        console.error("Error en MessageCreate:", error);
    }

});


client.login(config.TOKEN);
