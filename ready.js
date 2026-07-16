const {
EmbedBuilder,
ActionRowBuilder,
StringSelectMenuBuilder
} = require("discord.js");

const config = require("./config");

module.exports = async (client)=>{

const channel = await client.channels.fetch(config.PANEL_CHANNEL);

if(!channel) return;

const messages = await channel.messages.fetch({limit:10});

const oldPanel = messages.find(m=>m.author.id===client.user.id);

if(oldPanel){

await oldPanel.delete().catch(()=>{});

}

const embed = new EmbedBuilder()

.setColor("#a855f7")

.setTitle("SHOP DE OBJETOS <:money:1258873876763508737>")

.setDescription(`# SHOP DE OBJETOS <a:money:1258873876763508737>

Abrimos una tienda para compra de objetos:
**STEAL A BRAINROT, MURDER MISTERY, JAILBREAK, ADOPT ME, entre otros...**

# FORMAS DE PAGO

**1.** <:Robux:1422204392777715814> Robux

**2.** <:PayPal:1436114209241825492> Paypal

**3.** Cualquier moneda internacional.

**4.** Bancos de América Latina

• BBVA

• Grupo Santander

• Bancolombia

• Itau

• Scotiabank

# MÍNIMO DE COMPRA

• Equivalente a **15 USD**

• **500 ROBUX** en objetos

Selecciona una opción del menú para comenzar.`)

.setImage(config.PANEL_IMAGE);

const menu = new StringSelectMenuBuilder()

.setCustomId("panel")

.setPlaceholder("Selecciona una opción")

.addOptions([
{

label:"Venta de Objetos",

emoji:"📦",

description:"Vender objetos",

value:"venta"

}
]);

const row = new ActionRowBuilder()

.addComponents(menu);

await channel.send({

embeds:[embed],

components:[row]

});

};
