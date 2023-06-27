import moment from "moment";
import fetch from "node-fetch";
const client = new Discord.Client();
import TOKEN, { config } from "dotenv";
const token = TOKEN.config().parsed.TOKEN;
import Discord, { MessageAttachment, MessageEmbed } from "discord.js";

let verifiedUsers = [`strawhat19`, `xuruko`, `kayfoxii`];
let tableCommands = [`!results`, `!res`, `!table`, `!tab`, `!scores`, `!players`, `!leaderboard`];

const channels = {
  hotBoxDropBox: `908528224521306153`,
  brotherhoodBotTesting: `1123103995829964861`,
}

let players = [
  {
    name: `Ruko`,
    wins: 0,
    losses: 0,
    level: 1,
    experience: 0,
    record: [],
  },
  {
    name: `Kay`,
    wins: 0,
    losses: 0,
    level: 1,
    experience: 0,
    record: [],
  },
  {
    name: `Ricky`,
    wins: 0,
    losses: 0,
    level: 1,
    experience: 0,
    record: [],
  },
];

client.once(`ready`, () => {
  client.channels.cache.get(channels.brotherhoodBotTesting).send(`RukoBot is Online! Ready to start accepting commands!`);
});

client.on(`disconnect`, () => {
  client.channels.cache.get(channels.brotherhoodBotTesting).send(`RukoBot is Going Offline! Goodbye Bröthērs!`);
});

const sendTable = (msg) => {
  const table = `
    > **Results Table**
    > **Name**           Level          Experience        Wins             Losses
    ${players.sort((plyr1, plyr2) => plyr2.experience - plyr1.experience).map((plyr, plyrIndex) => {
        return `
          > **${plyr.name}**       Level: ${plyr.level}       Exp: ${plyr.experience}      Wins: ${plyr.wins}         Losses: ${plyr.losses}
        `;
      }).join(``)
    }
  `;
  msg.channel.send(table);
}

const resetPlayers = (msg) => {
  players = [
    {
      name: `Ruko`,
      wins: 0,
      losses: 0,
      level: 1,
      experience: 0,
      record: [],
    },
    {
      name: `Kay`,
      wins: 0,
      losses: 0,
      level: 1,
      experience: 0,
      record: [],
    },
    {
      name: `Ricky`,
      wins: 0,
      losses: 0,
      level: 1,
      experience: 0,
      record: [],
    },
  ];
}

client.on(`message`, (msg) => {
  if (msg.author.bot) {
    return;
  } else {
    if (verifiedUsers.includes(msg.author.username)) {
      if (msg.content.toLowerCase() == `!image`) {
        const attachment = new MessageAttachment("./assets/RukoBotPic.webp");
        msg.channel.send({ files: [attachment] });
      } else if (msg.content.toLowerCase() == `!commands`) {
        msg.channel.send(`Here are the RukoBot commands so far: [!add + name] to add a player, [!delete + name] to delete a player, [!results, !res, !table, !tab, !scores, !players, !leaderboard] to see Leaderboard. [!update + player one name + 'beats' + player two name + loser stocks taken] to update table, [!reset] to reset players back to 0 XP.`);
      } else if (tableCommands.includes(msg.content.toLowerCase())) {
        sendTable(msg);
      } else if (msg.content.toLowerCase().includes(`!update`)) {
        let splitUpMessageParams = msg.content.split(` `);
        let playerOne = splitUpMessageParams[1];
        let middleWord = splitUpMessageParams[2];
        let thirdWord = splitUpMessageParams[3];
        let stocksTaken = parseInt(splitUpMessageParams[4]) || 0;

        if (middleWord.toLowerCase() != `xp`) {
          players = players.map((plyr) => {
            if (plyr.name.toLowerCase() == playerOne.toLowerCase()) {
              plyr.wins = plyr.wins + 1;
              plyr.experience = plyr.experience + 400;
              // if (plyr.level <= 1) {
              //   plyr.experience = plyr.experience + 3;
              //   if (plyr.experience >= 10) {
              //     plyr.level = plyr.level + 1;
              //   }
              // } else if (plyr.level >= 2 && plyr.level <= 5) {
              //   plyr.experience = plyr.experience + 5;
              //   if (plyr.experience >= 25 && plyr.level == 2) {
              //     plyr.level = plyr.level + 1;
              //   } else if (plyr.level > 2 && plyr.experience >= (50 / (plyr.level / 3))) {
              //     plyr.level = plyr.level + 1;
              //   }
              // } else if (plyr.level >= 6 && plyr.level <= 10) {
              //   plyr.experience = plyr.experience + 10;
              //   if (plyr.experience >= 75) {
              //     plyr.level = plyr.level + 1;
              //   }
              // } else if (plyr.level >= 11 && plyr.level <= 15) {
              //   plyr.experience = plyr.experience + 15;
              //   if (plyr.experience >= 100) {
              //     plyr.level = plyr.level + 1;
              //   }
              // }
              plyr.record.push(`Win over ${thirdWord.charAt(0).toUpperCase() +
                thirdWord.slice(1).toLowerCase()} on ${moment().format(`MMMM Do YYYY, h:mm:ss a`)}`);
              return plyr;
            } else if (plyr.name.toLowerCase() == thirdWord.toLowerCase()) {
              plyr.losses = plyr.losses + 1;
              plyr.experience = plyr.experience + (100 * (stocksTaken));
              plyr.record.push(`Lost to ${playerOne.charAt(0).toUpperCase() +
                playerOne.slice(1).toLowerCase()} on ${moment().format(`MMMM Do YYYY, h:mm:ss a`)}`);
              return plyr;
            } else {
              return plyr;
            }
          });
        } else if (middleWord.toLowerCase() == `xp` || thirdWord.toLowerCase() == `xp`) {
          let expToAdd = 0;
          if (middleWord.toLowerCase() == `xp`) {
            expToAdd = parseInt(splitUpMessageParams[3]);
          } else {
            expToAdd = parseInt(splitUpMessageParams[2]);
          }
          players = players.map((plyr) => {
            if (plyr.name.toLowerCase() == playerOne.toLowerCase()) {
              plyr.experience = plyr.experience + expToAdd;
              return plyr;
            } else {
              return plyr;
            }
          });
        }

        sendTable(msg);
      } else if (msg.content.toLowerCase().split(` `)[0] == `!add`) {
        let splitUpMessageParams = msg.content.split(` `);
        let playerToAdd = splitUpMessageParams[1];

        if (playerToAdd) {
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
              experience: 0,
              record: []
            });
            sendTable(msg);
          }
        } else {
          msg.channel.send(`Please add a player name after the !add, like [!add playerName].`);
        }
      } else if (msg.content.toLowerCase().split(` `)[0] == `!addxp`) {
        let splitUpMessageParams = msg.content.split(` `);
        let firstWord = splitUpMessageParams[1];
        let secondWord = splitUpMessageParams[2];
        let playerName;
        let expToAdd;

        if (!isNaN(parseInt(firstWord))) {
          expToAdd = parseInt(firstWord);
          playerName = secondWord;
        } else {
          playerName = firstWord;
          expToAdd = parseInt(secondWord);
        }

        players = players.map((plyr) => {
          if (plyr.name.toLowerCase() == playerName.toLowerCase()) {
            plyr.experience = plyr.experience + expToAdd;
            return plyr;
          } else {
            return plyr;
          }
        });

        sendTable(msg);
      } else if (msg.content.toLowerCase().includes(`!delete`)) {
        let splitUpMessageParams = msg.content.split(` `);
        let playerToDelete = splitUpMessageParams[1];

        if (players.map((plyr) => plyr.name.toLowerCase()).includes(playerToDelete.toLowerCase())) {
          players = players.filter(plyr => plyr.name.toLowerCase() != playerToDelete.toLowerCase());
          sendTable(msg);
        } else {
          msg.channel.send(`Player does not exist in table.`);
        }
      } else if (msg.content.toLowerCase().includes(`!reset`)) {
        resetPlayers();
        sendTable(msg);
      }
    } else {
      msg.channel.send(`You are unuathorized to make this request!`);
    }
  }
});

client.login(token);