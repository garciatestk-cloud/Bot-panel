const {
Client,
GatewayIntentBits,
Partials,
Collection
} = require("discord.js");

const config = require("./config");
const ready = require("./ready");
const interactionCreate = require("./interactionCreate");

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.DirectMessages
],

partials: [
Partials.Channel,
Partials.Message,
Partials.User
]
});

client.commands = new Collection();

client.config = config;

client.once("ready", async () => {

console.clear();

console.log("========================================");
console.log(`🤖 Bot conectado como ${client.user.tag}`);
console.log(`🆔 ${client.user.id}`);
console.log("========================================");

await ready(client);

});

client.on("interactionCreate", async interaction => {

await interactionCreate(interaction, client);

});

client.login(process.env.TOKEN);
