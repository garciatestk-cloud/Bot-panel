const {
    Client,
    GatewayIntentBits,
    Partials,
    Events
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

// EVENTO READY
client.once(Events.ClientReady, async () => {
    console.clear();
    console.log("==============================");
    console.log(`✅ Conectado como ${client.user.tag}`);
    console.log("==============================");

    // Enviar panales
    await readyHandler(client);
});

// INTERACCIONES (MENÚS, MODALES, BOTONES)
client.on(Events.InteractionCreate, async (interaction) => {
    try {
        await interactionCreate(interaction);
        await buttonHandler(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) return;
        await interaction.reply({
            content: "❌ Ocurrió un error.",
            ephemeral: true
        });
    }
});

// MENSAJES (COMANDO Y DM)
client.on(Events.MessageCreate, async (message) => {
    try {
        // Comando para personalizar el Panel de Bases
        // Uso: !setpanel Título | Descripción | URL_DE_IMAGEN (opcional)
        if (message.content.startsWith("!setpanel")) {
            if (!message.member.roles.cache.has(config.STAFF_ROLE)) {
                return message.reply("❌ Solo el staff puede usar este comando.");
            }

            const args = message.content.slice(9).trim().split("|");
            const titulo = args[0]?.trim() || "📑 PANEL DE SOLICITUD DE BASES";
            const descripcion = args[1]?.trim() || "Ingresar texto";
            const imagen = args[2]?.trim() || message.attachments.first()?.url || null;

            const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

            const embed = new EmbedBuilder()
                .setColor("#a855f7")
                .setTitle(titulo)
                .setDescription(descripcion);

            if (imagen) embed.setImage(imagen);

            const options = Object.keys(config.BASES).map(baseName => ({
                label: baseName,
                emoji: "⭐️",
                value: baseName
            }));

            const menu = new StringSelectMenuBuilder()
                .setCustomId("base_panel")
                .setPlaceholder("⭐️ Selecciona una Base")
                .addOptions(options);

            const row = new ActionRowBuilder().addComponents(menu);

            const canalBases = await client.channels.fetch(config.BASES_PANEL_CHANNEL);
            if (canalBases) {
                const messages = await canalBases.messages.fetch({ limit: 10 });
                const oldPanel = messages.find(m => m.author.id === client.user.id);
                if (oldPanel) await oldPanel.delete().catch(() => {});

                await canalBases.send({ embeds: [embed], components: [row] });
                return message.reply("✅ Panel actualizado correctamente en el canal.");
            }
        }

        // Manejador de mensajes privados
        await dmHandler(message, client);

    } catch (error) {
        console.error("Error en MessageCreate:", error);
    }
});

client.login(config.TOKEN);
