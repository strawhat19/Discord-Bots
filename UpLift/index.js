import fetch from "node-fetch";
const client = new Discord.Client();
import TOKEN, { config } from "dotenv";
const token = TOKEN.config().parsed.TOKEN;
import Discord, { MessageAttachment, MessageEmbed } from "discord.js";

const channelIDs = {
  general: `312316512973357057`,
  hotboxDropbox: `908528224521306153`,
}

const channelToUse = channelIDs.hotboxDropbox;

const openingMessage = `UpLift is Online! This is a Discord Bot by Rakib Ahmed, https://github.com/strawhat19, to inspire you or motivate you when you're feeling down. Just type 'inspire me' into the chat and the bot will give you an inspirational quote to lift your mood!`;

const getQuotes = () => {
  return fetch("https://zenquotes.io/api/random/")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data[0]["q"] + " - " + data[0]["a"];
    });
};

let players = [
    {
        name: `Bob`,
        wins: 4,
        losses: 12,
        level: 36,
        experience: 125,
    },
    {
        name: `Sally`,
        wins: 5,
        losses: 6,
        level: 69,
        experience: 333,
    },
    {
        name: `Charlie`,
        wins: 18,
        losses: 3,
        level: 99,
        experience: 1000,
    },
];

client.once("ready", () => {
  client.channels.cache.get(channelToUse).send(openingMessage);
  console.log(openingMessage);
});

client.on("message", (msg) => {
  if (msg.author.bot) {
    return;
  } else {
    if (msg.content.toLowerCase() == `inspire me`) {
      getQuotes().then((quote) => msg.channel.send(quote));
    } else if (msg.content.toLowerCase() == `!image`) {
        const attachment = new MessageAttachment(
          "./assets/screenshotUpLift.JPG"
        );
        msg.channel.send({ files: [attachment] });
    } else if (msg.content.toLowerCase() == `!results`) {
        const table = `
            > **Name           Level          Experience        Wins             Losses**
            ${players
              .map((plyr, plyrIndex) => {
                return `
                    > **${plyr.name}**       Level: ${plyr.level}       Exp: ${plyr.experience}      Wins: ${plyr.wins}         Losses: ${plyr.losses}
                `;
              })
              .join(``)
            }
        `;
        msg.channel.send(table);
    } else if (msg.content.toLowerCase().includes(`!update`)) {
      let splitUpMessageParams = msg.content.split(` `);
      let playerOne = splitUpMessageParams[1];
      let playerTwo = splitUpMessageParams[3];

      players = players.map(plyr => {
        if (plyr.name.toLowerCase() == playerOne.toLowerCase()) {
            plyr.wins = plyr.wins + 1;
            return plyr;
        } else if (plyr.name.toLowerCase() == playerTwo.toLowerCase()) {
          plyr.losses = plyr.losses + 1;
          return plyr;
        } else {
          return plyr;
        }
      });

      msg.channel.send(`Successfully Updated Players, type !results to see the Updated Leaderboard.`);
    }   
  }
});

client.login(token);