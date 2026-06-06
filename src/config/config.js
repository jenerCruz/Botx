module.exports = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: 'gemini-1.5-flash'
  },
  bot: {
    sessionName: 'bot_session',
    autoRead: true,
    presence: 'available'
  }
};