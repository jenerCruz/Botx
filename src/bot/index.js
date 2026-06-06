const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');
const logger = require('./logger');

class WhatsAppBot {
  constructor() {
    this.sock = null;
    this.geminiModel = null;
  }

  async initializeGemini() {
    if (config.gemini.apiKey) {
      const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      this.geminiModel = genAI.getGenerativeModel({ model: config.gemini.model });
      logger.info('Gemini API initialized');
    }
  }

  async start() {
    await this.initializeGemini();
    
    const { state, saveCreds } = await useMultiFileAuthState(config.bot.sessionName);
    
    this.sock = makeWASocket({
      auth: state,
      logger: logger,
      printQRInTerminal: false,
      browser: ['Botx', 'Chrome', '10.0'],
      defaultQueryTimeoutMs: 60000
    });

    this.setupEventHandlers(saveCreds);
    
    return this.sock;
  }

  setupEventHandlers(saveCreds) {
    this.sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        qrcode.generate(qr, { small: true });
        logger.info('QR Code generated - scan with WhatsApp');
      }
      
      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
        logger.info(`Connection closed, reconnecting: ${shouldReconnect}`);
        if (shouldReconnect) this.start();
      } else if (connection === 'open') {
        logger.info('Bot connected successfully');
        this.printBotId();
      }
    });

    this.sock.ev.on('creds.update', saveCreds);
  }

  printBotId() {
    if (this.sock.user) {
      logger.info(`Bot ID: ${this.sock.user.id}`);
    }
  }

  async sendGeminiResponse(jid, text) {
    if (!this.geminiModel) return null;
    
    try {
      const result = await this.geminiModel.generateContent(text);
      return result.response.text();
    } catch (error) {
      logger.error('Gemini error:', error);
      return null;
    }
  }

  getSocket() {
    return this.sock;
  }

  isConnected() {
    return this.sock?.user !== undefined;
  }
}

module.exports = new WhatsAppBot();