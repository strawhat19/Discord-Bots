import Discord from "discord.js";
import fetch from "node-fetch";
import TOKEN, { config } from "dotenv";
const client = new Discord.Client();
const token = TOKEN.config().parsed.TOKEN;

const openingMessage = `UpLift is Online! This is a Discord Bot by Rakib Ahmed, https://github.com/strawhat19, to inspire you or motivate you when you're feeling down. Just type 'inspire me' into the chat and the bot will give you an inspirational quote to lift your mood!`;

const getQuotes = () => {
    return fetch("https://zenquotes.io/api/random/")
    .then(response => {
        return response.json();
    })
    .then(data => {
        return data[0]["q"] + " - " + data[0]["a"];
    })
}

// First let the bot connect to a channel
client.once(`ready`, () => {
    // Ruko's Private Commands Channel
    let privateChannelCode = `codeForPrivateChannel`;
    client.channels.cache.get(privateChannelCode).send(`Bot is connected to the Private Channel, ready to accept commands.`);
})

// Whenever a message is sent to the channel specified above
client.on(`message`, msg => {
    if (msg.author.bot) return; // Ignore the message if it was from another bot
    // Let's assume Ruko typed the command: !addxp 200 Bob
    if (msg.content.includes(`!addxp`)) {
        // Split the message into parts to read parameters
        let splitUpMessageParams = msg.content.split(` `); // Whenever the command has a space, split the data
        console.log(splitUpMessageParams); // Returns [`!addxp`, `200` `Bob`];
        let commandToExecute = splitUpMessageParams[0]; // Returns `!addxp`;
        let howMany = splitUpMessageParams[1]; // Returns `200`;
        let username = splitUpMessageParams[2]; // Returns `Bob`;

        // Send the params to database and let it update
        updateDatabase({
            commandToExecute,
            howMany,
            username
        }).then((onSuccessfulUpdate => {
            // Now read the updated values from database and send a success message back to Ruko in private channel
            msg.channel.send(onSuccessfulUpdate.successMessage);
            // Then update public twitch table or view with new data
            updatePublicData();
        }));

    } else if (msg.content.includes(`!results`)) { // Let's assume Ruko typed the command: !results <Bob> defeats <Sally>
        let splitUpMessageParams = msg.content.split(` `);
        console.log(splitUpMessageParams); // Returns [`!results`, `Bob`, `defeats` `Sally`];
        let commandToExecute = splitUpMessageParams[0]; // Returns `!results`;
        let playerOne = splitUpMessageParams[1]; // Returns `Bob`;
        let result = splitUpMessageParams[2]; // Returns `defeats`;
        let playerTwo = splitUpMessageParams[3]; // Returns `Sally`;

        // Send the params to database and let it update
        updatePlayers(commandToExecute, playerOne, result, playerTwo).then((onSuccessfulUpdate => {
            // Now read the updated values from database and send a success message back to Ruko in private channel
            msg.channel.send(onSuccessfulUpdate.successMessage);
            // Then update public twitch table or view with new data
            updatePlayerCards();
        }));

    } else if (msg.content.includes(`!differentCommand`)) {
        // Do something different
    } else {
        // Do something else
    }
})

client.login(token);