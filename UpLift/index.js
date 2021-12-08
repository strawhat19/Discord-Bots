import Discord from "discord.js";
import fetch from "node-fetch";
import TOKEN, { config } from "dotenv";
const client = new Discord.Client();
const token = TOKEN.config().parsed.TOKEN;

const openingMessage = `UpLift is Online! This is a Discord Bot by Rakib Ahmed, https://github.com/strawhat19, to inspire you or motivate you when you're feeling down. Just type 'inspire me' into the chat and the bot will give you an inspirational quote to lift your mood!`;

const getQuotes = () => {
    return fetch("https://zenquotes.io/api/random/")
    .then(response => {
        return response.json()
    })
    .then(data => {
        return data[0]["q"] + " - " + data[0]["a"]
    })
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
    if (msg.content === "inspire me") {
        getQuotes().then(quote => msg.channel.send(quote))
    }
})

client.login(token);