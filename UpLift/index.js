const Discord = require('discord.js');

// To invite this bot to your discord server, use this link => https://discord.com/oauth2/authorize?client_id=918103501039611915&scope=bot&permissions=1099511627775

const client = new Discord.Client();

client.once('ready', () => {
    console.log('UpLift is Online!');
})

client.on('message', msg => {
    if (msg.content === "sad") {
        msg.reply("why?")
    }
})

client.login(process.env.TOKEN);