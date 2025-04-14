const { Events, EmbedBuilder } = require('discord.js');
const config = require('../../../configs/bit-moderation/config.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        const client = message.client
        const user = message.author
        const member = message.member
        const guild = message.guild

        const regex = /discord(?:\.gg|(?:app)?\.com\/invite)\/([\w-]+)/gi;
        function check_for_invite(message) {
            const matches = message.match(regex)
            
            return matches;
        }

        if(!config[guild.id]) return;
        if(config[guild.id].invite_detection === false) return;

        const roles = message.member.roles.cache
        var exempted = false;

        for(const role of roles) {
            const role_id = role.toString().split(',')[0]
            if(config[guild.id].roles[role_id]) {
                if(config[guild.id].roles[role_id].exemptions.invite_detection === true) {
                    exempted = true;
                }
            }
        }

        if(exempted === false) {
            console.log(check_for_invite(message.content))
            const matches = check_for_invite(message.content)
            if(matches?.length) {
                const invite_code = regex.exec(message.cleanContent)[1]
                const invite = await client.fetchInvite(invite_code);

                if(invite.guild.id != message.guild.id) {
                    if(member.kickable) {
                        member.timeout(48*60*60*1000, 'Discord Invite Detected!');
                        const embed = new EmbedBuilder()
                            .setDescription("A user named "+user.toString()+" has sent a Discord Invite Link. They've been muted and their message deleted.")
                            .addFields({ name: "Invite Guild", value: invite.guild.name, inline: true })
                            .addFields({ name: 'Message Content', value: message.cleanContent, inline: false })
                            .setColor(config.embedColours.negative)
                            .setFooter({ text: 'User ID '+user.id})
                            .setTimestamp()
                        client.channels.cache.get(config[guild.id].logging).send({ embeds: [embed] })
                        message.delete();
                    } else {
                        const embed = new EmbedBuilder()
                            .setDescription("A user named "+user.toString()+" has sent a Discord Invite Link. However I cannot mute them nor delete their message.")
                            .addFields({ name: "Invite Guild", value: invite.guild.name, inline: true })
                            .addFields({ name: 'Message Content', value: message.cleanContent, inline: false })
                            .setColor(config.embedColours.negative)
                            .setFooter({ text: 'User ID '+user.id})
                            .setTimestamp()
                        client.channels.cache.get(config[guild.id].logging).send({ embeds: [embed] })
                    }
                }
            }
        }
    }
}
