const logger = require('../logger');
require('dotenv').config();

var Airtable = require('airtable');
var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY }).base('appoqAzoaA49boMKH');

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message) {
        // Discord non-midjourney messages
        if (message.author.id != process.env.MIDJOURNEY_ID) return;

        // Discord temporary messages
        if (message.attachments.size == 0) return;

        console.log(message);
        // check if collection map is empty

		// Logging event
		logger.info(
			{
                message_id: message.id,
                member_id: message.author.id,
                username: message.author.username,
                bot: message.author.bot,
                member_name: message.member_name,
                content: message.content,
                ...(message.attachments.size) && { url: message.attachments.first().url }
			},
			'Message created:'
		);

        // Get Discord member information from ID emmbeded in content message
        const id = message.content.match(/(<@)(\d+)(>)/i)[2]
        const member = await message.guild.members.cache.get(id);
        
        logger.info(
            {
                member_id: member.user.id,
                member_username: member.user.username,
                ...(member.nickname) && { nickname: member.nickname }
            }
        )

        // Add record to Midjourney Voter Airtable
        await base('Midjourney Voter').create([
            {
              "fields": {
                "Message Id": message.id,
                "Member Id": member.user.id,
                "Username": member.user.username,
                "Prompt": message.content.match(/(\*\*)(.+)(\*\*)/i)[2],
                "Votes": 1,
                "Image": [
                    {
                      "url": message.attachments.first().url
                    }
                  ],
                ...(member.nickname) && { "Nickname": member.nickname },
              }
            }
          ], function(err, records) {
            if (err) {
              console.error(err);
              return;
            }
            records.forEach(function (record) {
                logger.info( {
                    record_id: record.getId()
                }, "Record created")
            });
          });

          await message.react('😍');
	},
};