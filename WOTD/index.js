import Discord from 'discord.js';
import fetch from 'node-fetch';
import TOKEN, { config } from 'dotenv';
const client = new Discord.Client();
const token = TOKEN.config().parsed.TOKEN;

const openingMessage = `
> **Word Of The Day is Online!** This is a Discord Bot by Rakib Ahmed designed to provide your server with a random word of the day to help increase your vocabulary! Type 'wotd' or 'WOTD' to activate!
`;

const getWords = () => {
    return fetch(`https://random-words-api.vercel.app/word`)
    .then(response => response.json())
    .then(word => word)
    .catch(err => {
        console.error(err);
    });
}

client.once('ready', () => {
    // Hotbox DropBox Channel
    // client.channels.cache.get('908528224521306153').send(openingMessage);
    // General Channel
    // client.channels.cache.get('312316512973357057').send(openingMessage);
    console.log(openingMessage);
})

client.on('message', msg => {
    if (msg.author.bot) return
    if (msg.content === "wotd" || msg.content === "WOTD") {
        getWords().then(word => msg.channel.send(`
        Word of the Day: 
        > **${word[0].word}** - ${word[0].definition}
        `))
    }
})

client.login(token);