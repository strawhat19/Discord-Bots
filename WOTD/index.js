import TOKEN from 'dotenv';
import fetch from 'node-fetch';
import Discord from 'discord.js';

const client = new Discord.Client();
const token = TOKEN.config().parsed.TOKEN;

const channelIDs = {
    general: `312316512973357057`,
    hotboxDropbox: `908528224521306153`,
}

const sendOpeningMessage = false;
const channelToUse = channelIDs.hotboxDropbox;

const randomWordAPIURL = `https://random-word-api.vercel.app/api`;
const openingCommands = [`op`, `opn`, `open`, `opening`, `message`];
const dictionaryAPIURL = `https://api.dictionaryapi.dev/api/v2/entries/en`;
const commands = [`w`, `wr`, `wd`, `wrd`, `wotd`, `word`, `wordd`, `generate word`, `word of the day`];

const noDefinitionFoundMessage = `No Definiton Found`;
const description = `This is a Discord Bot by Rakib Ahmed designed to provide your server with a random word of the day to help increase your vocabulary!`;
const openingMessage = `
> **Word Of The Day is Online!** ${description}`;

const capWords = (str) => str.replace(/\b\w/g, (match) => match.toUpperCase());
const sendMessageToChannel = (message, channelID = channelToUse) => client.channels.cache.get(channelID).send(message);
const matchesString = (input, array) => array.map(s => s.toLowerCase().replace(/[^a-z0-9]/g, ``)).includes(input.toLowerCase().replace(/[^a-z0-9]/g, ``));

const getWord = async () => {
    return await fetch(randomWordAPIURL)
    .then(response => response.json())
    .then(word => word)
    .catch(err => {
        const errorMessage = `Error fetching Word from Vercel Random Word API`;
        sendMessageToChannel(errorMessage);
        console.log(errorMessage, err);
    });
}

const getDefinition = async (word) => {
    return await fetch(`${dictionaryAPIURL}/${word}`)
    .then(response => response.json())
    .then(definition => JSON.parse(JSON.stringify(definition)))
    .catch(err => {
        const errorMessage = `Error fetching Word from Dictionary API`;
        sendMessageToChannel(errorMessage);
        console.log(errorMessage, err);
    });
}


client.once(`ready`, () => {
    console.log(openingMessage);
    if (sendOpeningMessage) {
        sendMessageToChannel(openingMessage);
    }
})

client.on(`message`, async msg => {
    if (msg.author.bot) return;
    
    const usersInput = msg.content;
    const matchesWOTDCommand = matchesString(usersInput, commands);
    const matchesOpeningCommand = matchesString(usersInput, openingCommands);

    if (matchesOpeningCommand) {
        sendMessageToChannel(openingMessage);
    } else if (matchesWOTDCommand) {
        await getWord().then(async word => {
            if (word) {
                let wotd = word;
                let definition = noDefinitionFoundMessage;

                if (word.length > 0) {
                    wotd = word[0];
                    if (word[0].word && word[0].definition) {
                        wotd = word[0].word;
                        definition = word[0].definition;
                    }
                }

                let meaning;
                let dictionaryEntry;

                if (definition == noDefinitionFoundMessage) {
                    await getDefinition(wotd).then(defs => {
                        if (defs && defs.length > 0) {
                            dictionaryEntry = defs[0];
                            if (dictionaryEntry) {
                                const { meanings } = dictionaryEntry;
                                if (meanings && meanings.length > 0) {
                                    meaning = meanings[0];
                                    if (meaning) {
                                        const { definitions } = meaning;
                                        if (definitions && definitions.length > 0) {
                                            const firstDefinition = definitions[0];
                                            if (firstDefinition) {
                                                definition = firstDefinition.definition;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    })
                }
                
                msg.channel.send(`
                    Word of the Day: 
                    > **${capWords(wotd)}** - ${definition}
                `)
            }
        })
    }
})

client.login(token);