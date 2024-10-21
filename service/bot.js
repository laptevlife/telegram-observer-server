// bot.js
const TelegramBot = require('node-telegram-bot-api');

token = process.env.BOT_KEY; // Замените на ваш токен
const bot = new TelegramBot(token, { polling: true });

module.exports = bot;