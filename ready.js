const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const config = require("./config");

module.exports = async (client) => {
    // 1. PANEL TIENDA ANTERIOR
    try {
        const channelTienda = await client.channels.fetch(config.PANEL_CHANNEL);
        if (channelTienda) {
            const messages = await channelTienda.messages.fetch({ limit: 10 });
            const oldPanel = messages.find(m => m.author.id === client.user.id);
            if (oldPanel) await oldPanel.delete().catch(() => {});

            const embedTienda = new EmbedBuilder()
                .setColor("#a855f7")
                .setTitle("SHOP DE OBJETOS <:money:1258873876763508737>")
                .setDescription(`# SHOP DE OBJETOS <a:money:1258873876763508737>\n\nAbrimos una tienda para compra de objetos:\n**STEAL A BRAINROT, MURDER MISTERY, JAILBREAK, ADOPT ME, entre otros...**\n\n# FORMAS DE PAGO\n\n**1.** <:Robux:1422204392777715814> Robux\n**2.** <:PayPal:1436114209241825492> Paypal\n**3.** Cualquier moneda internacional.\n**4.** Bancos de América Latina\n• BBVA\n• Grupo Santander\n• Bancolombia\n• Itau\n• Scotiabank\n\n# MÍNIMO DE COMPRA\n\n• Equivalente a **15 USD**\n• **500 ROBUX** en objetos\n\nSelecciona una opción del menú para comenzar.`)
                .setImage(config.PANEL_IMAGE);

            const menuTienda = new StringSelectMenuBuilder()
                .setCustomId("shop_panel")
                .setPlaceholder("Selecciona una opción")
                .addOptions([{ label: "Venta de Objetos", emoji: "📦", description: "Vender objetos", value: "venta" }]);

            await channelTienda.send({ embeds: [embedTienda], components: [new ActionRowBuilder().addComponents(menuTienda)] });
        }
    } catch (e) { console.error("Error cargando panel tienda:", e); }

    // 2. NUEVO PANEL DE BASES
    try {
        const channelBases = await client.channels.fetch(config.BASES_PANEL_CHANNEL);
        if (channelBases) {
            const messages = await channelBases.messages.fetch({ limit: 10 });
            const oldPanelBases = messages.find(m => m.author.id === client.user.id);
            if (oldPanelBases) await oldPanelBases.delete().catch(() => {});

            const embedBases = new EmbedBuilder()
                .setColor("#a855f7")
                .setTitle("📑 PANEL DE SOLICITUD DE BASES")
                .setDescription("Selecciona la **Base** que deseas solicitar en el menú desplegable.");

            const options = Object.keys(config.BASES).map(baseName => ({
                label: baseName,
                emoji: "⭐️",
                value: baseName
            }));

            const menuBases = new StringSelectMenuBuilder()
                .setCustomId("base_panel")
                .setPlaceholder("⭐️ Selecciona una Base")
                .addOptions(options);

            await channelBases.send({ embeds: [embedBases], components: [new ActionRowBuilder().addComponents(menuBases)] });
        }
    } catch (e) { console.error("Error cargando panel bases:", e); }
};
