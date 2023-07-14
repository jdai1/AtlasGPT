require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot || message.author.system) return;
    if (message.channel.name !== "test") return;

    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message.content }],
    });
    console.log('chatCompletion finished');
    const response = chatCompletion.data.choices[0].message.content;
    if (response.length > 2000) {
      var chunk = ''
      var hasCode = false;
      const stream = response.split('\n');
      for (const i in stream) {
        if (chunk.length + stream[i].length > 2000) {
          console.log(hasCode);
          chunk = hasCode ? chunk + '```' : chunk;
          message.reply(chunk);
          chunk = hasCode ? '```' : '';
        }
        if (stream[i].match(/```/g) !== null && stream[i].match(/```/g).length % 2 == 1) hasCode = !hasCode;
        chunk += stream[i] + '\n'
      }
      if (chunk !== '') message.reply(chunk);
    } else {
      message.reply(response);
    }
    
  } catch (error) {
    console.log(error);
  }
});

client.login(process.env.DISCORD_TOKEN);
console.log("AtlasGPT is online");
