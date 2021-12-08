const Discord = require('discord.js');

// const client = new Discord.Client({ intents: [Enter intents here] });
// To invite this bot to your discord server, use this link => https://discord.com/oauth2/authorize?client_id=918081751304245248&scope=bot&permissions=1099511627775
const client = new Discord.Client();

client.once('ready', () => {
    console.log('Tuber is Online!');
})

client.login('OTE4MDgxNzUxMzA0MjQ1MjQ4.YbCEQg.MWGcEroXykBzq-Yi5Z3Ly_GGSEs');