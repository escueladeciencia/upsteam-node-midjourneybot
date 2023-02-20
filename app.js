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


// Add command collection to client
// https://discordjs.guide/creating-your-bot/command-handling.html#individual-command-files
client.commands = new Collection();

// Read command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

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