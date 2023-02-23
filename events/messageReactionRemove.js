const logger = require('../logger');
require('dotenv').config();

var Airtable = require('airtable');
var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY }).base('appoqAzoaA49boMKH');

module.exports = {
	name: 'messageReactionRemove',
	once: false,
	async execute(reaction, user) {
        // When a reaction is received, check if the structure is partial
        if (reaction.partial) {
            // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message:', error);
                // Return as `reaction.message.author` may be undefined/null
                return;
            }
        }

        // Discord non-midjourney messages
        if (reaction.message.author.id != process.env.MIDJOURNEY_ID) return;

        // Discord bot reactions
        if (user.bot == true) return;

		// Logging event
		logger.info(
			{
                message_id: reaction.message.id,
                member_id: user.id,
                member_username: user.username,
                emoji: reaction._emoji.name,
			},
			'Reaction removed:'
		);

        // Discord non 😍 reactions
        if (reaction._emoji.name != '😍') return;

        // Get 😍 count
        const count = reaction.count;

        // Retrieve record id from Airtable from message id
        await base('Midjourney Voter').select({
            // Selecting the first 3 records in Grid view:
            maxRecords: 1,
            view: "Records",
            filterByFormula: `{Message Id} = "${reaction.message.id}"`
        }).eachPage(async function page(records, fetchNextPage) {
            // This function (`page`) will get called for each page of records.
            if (records.length == 1) {
                await base('Midjourney Voter').update(records[0].id, {
                    "Votes": count
                  }, function(err, record) {
                    if (err) {
                      console.error(err);
                      return;
                    }
                  });
            }
        });
	},
};