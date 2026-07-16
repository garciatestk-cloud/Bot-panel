const {
    Client,
    GatewayIntentBits,
    Partials,
    Events
} = require("discord.js");

const config = require("./config");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Channel
    ]
});

client.once(Events.ClientReady, async () => {

    console.clear();

    console.log("==============================");
    console.log(`✅ Conectado como ${client.user.tag}`);
    console.log("==============================");

});

client.login(config.TOKEN);
