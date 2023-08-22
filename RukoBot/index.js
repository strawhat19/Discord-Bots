import moment from "moment";
import { config } from "dotenv";
config();
const client = new Discord.Client();
import Discord, { MessageAttachment, MessageEmbed } from "discord.js";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  appId: process.env.APPID,
  apiKey: process.env.APIKEY,
  projectId: process.env.PROJECTID,
  authDomain: process.env.AUTHDOMAIN,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID,
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
import { doc, setDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';

let verifiedUsers = [`strawhat19`, `xuruko`, `kayfoxii`];
let tableCommands = [`!results`, `!res`, `!table`, `!tab`, `!scores`, `!players`, `!leaderboard`];

const channels = {
  hotBoxDropBox: `1123103995829964861`,
  // hotBoxDropBox: `908528224521306153`,
  brotherhoodBotTesting: `1123103995829964861`,
}

const getTimezone = (date) => {
  const timeZoneString = new Intl.DateTimeFormat(undefined, {timeZoneName: `short`}).format(date);
  const match = timeZoneString.match(/\b([A-Z]{3,5})\b/);
  return match ? match[1] : ``;
}

const formatDate = (date, specificPortion) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? `PM` : `AM`;
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour `0` should be `12`
  minutes = minutes < 10 ? `0` + minutes : minutes;
  let strTime = hours + `:` + minutes + ` ` + ampm;
  let strTimeNoSpaces = hours + `:` + minutes + `_` + ampm;
  let completedDate = strTime + ` ` + (date.getMonth() + 1) + `/` + date.getDate() + `/` + date.getFullYear();
  let timezone = getTimezone(date);

  if (specificPortion == `time`) {
    completedDate = strTime;
  } else if (specificPortion == `date`) {
    completedDate = (date.getMonth() + 1) + `-` + date.getDate() + `-` + date.getFullYear();
  } else if (specificPortion == `timezone`) {
    completedDate = strTime + ` ` + (date.getMonth() + 1) + `-` + date.getDate() + `-` + date.getFullYear() + ` ` + timezone;
  } else if (specificPortion == `timezoneNoSpaces`) {
    completedDate = strTimeNoSpaces + `_` + (date.getMonth() + 1) + `-` + date.getDate() + `-` + date.getFullYear() + `_` + timezone;
  } else {
    completedDate = strTime + ` ` + (date.getMonth() + 1) + `-` + date.getDate() + `-` + date.getFullYear() + ` ` + timezone;
  }

  return completedDate;
};

const generateUniqueID = (existingIDs) => {
  const generateID = () => {
    let id = Math.random().toString(36).substr(2, 9);
    return Array.from(id).map(char => {
      return Math.random() > 0.5 ? char.toUpperCase() : char;
    }).join(``);
  };
  let newID = generateID();
  if (existingIDs && existingIDs.length > 0) {
    while (existingIDs.includes(newID)) {
      newID = generateID();
    }
  }
  return newID;
};

let players = [];
const addPlayerToDB = async (playerObj) => await setDoc(doc(db, `players`, playerObj?.ID), playerObj);

export const calcPlayerWins = (plyr) => plyr.plays.filter(ply => ply.winner.toLowerCase() == plyr.name.toLowerCase()).length;
export const calcPlayerLosses = (plyr) => plyr.plays.filter(ply => ply.loser.toLowerCase() == plyr.name.toLowerCase()).length;

export const getActivePlayersFromDatabase = async () => {
  try {
    const playersSnapshot = await getDocs(collection(db, `players`));
    const activePlayers = playersSnapshot.docs.map(doc => doc.data()).filter(plyr => !plyr.disabled).sort((a,b) => {
      if (b.experience.arenaXP !== a.experience.arenaXP) {
        return b.experience.arenaXP - a.experience.arenaXP;
      }
      return b.plays.length - a.plays.length;
    });
    return activePlayers;
  } catch (error) {
    return error;
  }
}

const createPlayer = (playerName, playerIndex, databasePlayers) => {
  let currentDateTimeStamp = formatDate(new Date());
  let uniqueIndex = databasePlayers.length + 1 + playerIndex;
  let currentDateTimeStampNoSpaces = formatDate(new Date(), `timezoneNoSpaces`);
  let uuid = generateUniqueID(databasePlayers.map(plyr => plyr?.uuid || plyr?.id));
  let displayName = playerName.charAt(0).toUpperCase() + playerName.slice(1).toLowerCase();
  let id = `${uniqueIndex}_Player_${displayName}_${currentDateTimeStampNoSpaces}_${uuid}`;
  let ID = `${uniqueIndex} ${displayName} ${currentDateTimeStamp} ${uuid}`;
  let playerObj = {
    id,
    ID,
    uuid,
    displayName,
    expanded: false,
    playerLink: false,
    name: displayName,
    lastUpdatedBy: id,
    plays: [],
    created: currentDateTimeStamp,
    updated: currentDateTimeStamp,
    lastUpdated: currentDateTimeStamp,
    level: {
      num: 1,
      name: `Bronze Scimitar`
    },
    roles: [
      {
        promoted: currentDateTimeStamp,
        name: `Player`,
        level: 1,
      }
    ],
    experience: {
      xp: 0,
      arenaXP: 0,
      nextLevelAt: 83,
      remainingXP: 83
    },
  };
  return playerObj;
}

const createPlayers = async (splitUpMessageParams) => {
  let channel = client.channels.cache.get(channels.hotBoxDropBox);
  let activeDatabasePlayers = await getActivePlayersFromDatabase();
  let playersToAdd = splitUpMessageParams.filter((comm, commIndex) => commIndex != 0 && comm);
  [...new Set(playersToAdd)].forEach((plyr, plyrIndex) => {
    let playerObj = createPlayer(plyr, plyrIndex, activeDatabasePlayers);
    if (!activeDatabasePlayers.map(playr => playr.name.toLowerCase()).some(nam => nam == plyr.toLowerCase())) {
      addPlayerToDB(playerObj);
      sendTable();
      return playerObj;
    } else {
      channel.send(`Player(s) with those name(s) already exist.`);
      return;
    }
  });
}

const sendTable = async (msg, playrsFrmDB) => {
  playrsFrmDB = await getActivePlayersFromDatabase();
  let IDEnabled = true;
  let createdUUIDEnabled = false;
  let channel = client.channels.cache.get(channels.hotBoxDropBox);
  if (playrsFrmDB.length > 0) {
    channel.send(`
      > **Results Table** (please give it time to process data)
      > **Rank**           **Name**           **Level**          **Experience**        **Wins**             **Losses**
    `);

    playrsFrmDB.map((plyr, plyrIndex) => {
      return channel.send(`
      > **${plyrIndex + 1}**       **${plyr.name}**       **Level:** ${plyr.level.num} *${plyr.level.name}*       **Exp:** *${plyr.experience.arenaXP}*      **Wins:** *${calcPlayerWins(plyr)}*         **Losses:** *${calcPlayerLosses(plyr)}*
      > **ID**: *${plyr.ID}*
    `);
    }).join(``)
  }
}

// const sendTableFromDatabase = (playrsFrmDB) => {
//   let channel = client.channels.cache.get(channels.hotBoxDropBox);
//   if (playrsFrmDB.length > 0) {
//     channel.send(`
//       > **Results Table**
//       > **Rank**           **Name**           Level          Experience        Wins             Losses
//     `);

//     playrsFrmDB.map((plyr, plyrIndex) => {
//       return channel.send(`
//       > **${plyrIndex + 1}**       **${plyr.name}**       Level: ${plyr.level.name}-${plyr.level.num}       Exp: ${plyr.experience.arenaXP}      Wins: ${calcPlayerWins(plyr)}         Losses: ${calcPlayerLosses(plyr)}
//     `);
//     }).join(``)
//   }
// }

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

client.once(`ready`, () => {
  console.log(`RukoBot is Online! Ready to start accepting commands!`);
  client.channels.cache.get(channels.hotBoxDropBox).send(`RukoBot is Online! Ready to start accepting commands!`);
  
  // const unsubscribeFromSmasherScapeSnapShot = onSnapshot(collection(db, `players`), (querySnapshot) => {
  //   const playersFromDatabase = [];
  //   querySnapshot.forEach((doc) => playersFromDatabase.push(doc.data()));
  //   players = playersFromDatabase.filter(plyr => !plyr.disabled).sort((a,b) => {
  //     if (b.experience.arenaXP !== a.experience.arenaXP) {
  //       return b.experience.arenaXP - a.experience.arenaXP;
  //     }
  //     return b.plays.length - a.plays.length;
  //   });
  //   sendTableFromDatabase(playersFromDatabase.filter(plyr => !plyr.disabled).sort((a,b) => {
  //     if (b.experience.arenaXP !== a.experience.arenaXP) {
  //       return b.experience.arenaXP - a.experience.arenaXP;
  //     }
  //     return b.plays.length - a.plays.length;
  //   }));
  // });

  // process.on(`SIGINT`, () => {
  //   client.channels.cache.get(channels.hotBoxDropBox).send(`RukoBot is Going Offline! Goodbye Bröthērs!`);
  //   unsubscribeFromSmasherScapeSnapShot();
  //   client.destroy();
  //   process.exit();
  // });
});

client.on(`disconnect`, () => {
  console.log(`RukoBot is Going Offline! Goodbye Bröthērs!`);
  client.channels.cache.get(channels.hotBoxDropBox).send(`RukoBot is Going Offline! Goodbye Bröthērs!`);
});

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
      } else if (msg.content.toLowerCase().includes(`!upd`)) {
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
          createPlayers(splitUpMessageParams);
          // if (players.map((plyr) => plyr.name).includes(playerToAdd.toLowerCase())) {
          //   msg.channel.send(`This player is already in the table!`);
          // } else {
          //   players.push({
          //     name:
          //       playerToAdd.charAt(0).toUpperCase() +
          //       playerToAdd.slice(1).toLowerCase(),
          //     wins: 0,
          //     losses: 0,
          //     level: 1,
          //     experience: 0,
          //     record: []
          //   });
          //   sendTable(msg);
          // }
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

client.login(process.env.TOKEN);