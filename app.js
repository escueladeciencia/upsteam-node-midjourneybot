const fs = require('fs');
require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');

// Discord.js client
const client = new Client({
	'intents': [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
 });

// Read event files
// https://discordjs.guide/creating-your-bot/event-handling.html#individual-event-files
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, async (...args) => event.execute(...args));
	} else {
		client.on(event.name, async (...args) => event.execute(...args));
	}
}

client.login(process.env.BOT_TOKEN);