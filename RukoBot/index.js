import fetch from "node-fetch";
const client = new Discord.Client();
import TOKEN, { config } from "dotenv";
const token = TOKEN.config().parsed.TOKEN;
import Discord, { MessageAttachment, MessageEmbed } from "discord.js";

let verifiedUsers = [`strawhat19`];
let tableCommands = [`!results`, `!table`, `!scores`, `!players`, `!leaderboard`];

let players = [
  {
    name: `Bob`,
    wins: 0,
    losses: 0,
    level: 1,
    experience: 1,
  },
  {
    name: `Sally`,
    wins: 0,
    losses: 0,
    level: 1,
    experience: 1,
  },
  {
    name: `Charlie`,
    wins: 0,
    losses: 0,
    level: 1,
    experience: 1,
  },
];

client.once("ready", () => {
  // Hotbox DropBox Channel
  client.channels.cache.get("908528224521306153").send(`RukoBot is Online! Ready to start accepting commands!`);
});

const sendTable = (msg) => {
  const table = `
    > **Results Table**
    > **Name**           Level          Experience        Wins             Losses
    ${players
      .map((plyr, plyrIndex) => {
        return `
            > **${plyr.name}**       Level: ${plyr.level}       Exp: ${plyr.experience}      Wins: ${plyr.wins}         Losses: ${plyr.losses}
        `;
      })
      .join(``)}
  `;
  msg.channel.send(table);
}

client.on("message", (msg) => {
  if (msg.author.bot) {
    return;
  } else {
    if (verifiedUsers.includes(msg.author.username)) {
      if (msg.content.toLowerCase() == `!image`) {
        const attachment = new MessageAttachment("./assets/RukoBotPic.webp");
        msg.channel.send({ files: [attachment] });
      } else if (tableCommands.includes(msg.content.toLowerCase())) {
        sendTable(msg);
      } else if (msg.content.toLowerCase().includes(`!update`)) {
        let splitUpMessageParams = msg.content.split(` `);
        let playerOne = splitUpMessageParams[1];
        let playerTwo = splitUpMessageParams[3];

        players = players.map((plyr) => {
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

        sendTable(msg);
      } else if (msg.content.toLowerCase().includes(`!add`)) {
        let splitUpMessageParams = msg.content.split(` `);
        let playerToAdd = splitUpMessageParams[1];

        if (players.map((plyr) => plyr.name).includes(playerToAdd.toLowerCase())) {
          msg.channel.send(`This player is already in the table!`);
        } else {
          players.push({
            name:
              playerToAdd.charAt(0).toUpperCase() +
              playerToAdd.slice(1).toLowerCase(),
            wins: 0,
            losses: 0,
            level: 1,
            experience: 1,
          });
          sendTable(msg);
        }
      } else if (msg.content.toLowerCase().includes(`!delete`)) {
        let splitUpMessageParams = msg.content.split(` `);
        let playerToDelete = splitUpMessageParams[1];

        if (players.map((plyr) => plyr.name.toLowerCase()).includes(playerToDelete.toLowerCase())) {
          players = players.filter(plyr => plyr.name.toLowerCase() != playerToDelete.toLowerCase());
          sendTable(msg);
        } else {
          msg.channel.send(`Player does not exist in table.`);
        }
      }
    } else {
      msg.channel.send(`You are unuathorized to make this request!`);
    }
  }
});

client.login(token);