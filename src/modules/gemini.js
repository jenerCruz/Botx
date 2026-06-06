const bot = require('../bot');

module.exports = {
  name: 'gemini',
  command: 'ai',
  
  async handle(sock, jid, text) {
    if (!text) {
      await sock.sendMessage(jid, { text: 'Usage: !ai <question>' });
      return;
    }
    
    const response = await bot.sendGeminiResponse(jid, text);
    if (response) {
      await sock.sendMessage(jid, { text: response });
    } else {
      await sock.sendMessage(jid, { text: 'Error: Gemini not configured or unavailable' });
    }
  }
};