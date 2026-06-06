const express = require('express');
const path = require('path');
const fs = require('fs');
const bot = require('./bot');
const { loadModules } = require('./modules/loader');
const handler = require('./bot/handler');
const config = require('./config/config');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

app.get('/api/config', (req, res) => {
  res.json({
    geminiApiKey: config.gemini.apiKey,
    geminiModel: config.gemini.model,
    sessionName: config.bot.sessionName,
    autoRead: config.bot.autoRead,
    presence: config.bot.presence
  });
});

app.post('/api/config', (req, res) => {
  const { geminiApiKey, geminiModel, sessionName, autoRead, presence } = req.body;
  config.gemini.apiKey = geminiApiKey;
  config.gemini.model = geminiModel || 'gemini-1.5-flash';
  config.bot.sessionName = sessionName || 'bot_session';
  config.bot.autoRead = autoRead;
  config.bot.presence = presence;
  fs.writeFileSync(
    path.join(__dirname, '../config/config.js'),
    `module.exports = {\n  gemini: {\n    apiKey: '${geminiApiKey}',\n    model: '${geminiModel || 'gemini-1.5-flash'}'\n  },\n  bot: {\n    sessionName: '${sessionName || 'bot_session'}',\n    autoRead: ${autoRead},\n    presence: '${presence}'\n  }\n};\n`
  );
  res.json({ success: true });
});

app.get('/api/status', (req, res) => {
  res.json({
    connected: bot.isConnected(),
    botId: bot.getSocket()?.user?.id || null
  });
});

function startServer() {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Frontend: http://localhost:${port}`);
  });
}

async function main() {
  console.log('Starting Botx...');
  
  loadModules();
  
  const sock = await bot.start();
  
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const message of messages) {
      if (message.key.fromMe) continue;
      await handler.handle(message);
    }
  });
  
  startServer();
}

main().catch(console.error);