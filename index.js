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


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});


client.once(Events.ClientReady, async () => {

    console.clear();

    console.log("========================================");
    console.log(`✅ Conectado como ${client.user.tag}`);
    console.log("========================================");

    const canalId = "1520084959522586646";

    console.log(`🔎 Buscando el canal con ID: ${canalId}...`);

    try {

        const channel = await client.channels.fetch(canalId);

        if (!channel) {
            console.log("❌ No se encontró el canal con la ID especificada.");
            return;
        }

        console.log(`✅ Canal localizado correctamente: #${channel.name}`);

        const embed = new EmbedBuilder()
            .setColor("#a855f7")
            .setTitle("📑 PANEL DE BASES")
            .setDescription("Ingresar texto");

        const options = Object.keys(config.BASES || {
            "Base Cyber": "1",
            "Base Divine": "2"
        }).map(baseName => ({
            label: baseName,
            emoji: "⭐️",
            value: baseName
        }));

        const menu = new StringSelectMenuBuilder()
            .setCustomId("base_panel")
            .setPlaceholder("⭐️ Selecciona una opción")
            .addOptions(options);

        const row = new ActionRowBuilder()
            .addComponents(menu);

        await channel.send({
            embeds: [embed],
            components: [row]
        });

        console.log("🎉 ¡PANEL ENVIADO CORRECTAMENTE AL CANAL!");

    } catch (error) {

        console.error("❌ Se produjo un error al intentar enviar el mensaje:");
        console.error(error);

    }

});


client.login(config.TOKEN);
