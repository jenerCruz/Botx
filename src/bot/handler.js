const bot = require('./index');
const logger = require('./logger');

class MessageHandler {
  constructor() {
    this.commands = new Map();
    this.middleware = [];
  }

  register(command, handler) {
    this.commands.set(command, handler);
  }

  addMiddleware(fn) {
    this.middleware.push(fn);
  }

  async handle(message) {
    const jid = message.key.remoteJid;
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text;

    for (const mw of this.middleware) {
      const result = await mw(message);
      if (!result) return;
    }

    if (text?.startsWith('!')) {
      const [cmd, ...args] = text.slice(1).split(' ');
      const handler = this.commands.get(cmd.toLowerCase());
      if (handler) {
        await handler(bot.getSocket(), jid, args.join(' '), message);
      }
    }
  }
}

module.exports = new MessageHandler();