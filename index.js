require('dotenv').config();

// const { Api, TelegramClient } = require("telegram");
// const { StringSession } = require("telegram/sessions");
// const TelegramBot = require('node-telegram-bot-api');
// const { Client } = require('pg');
// const input = require('input')

const app = require('./app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const userController = require('./controllers/userController');
const tgController = require('./controllers/tgController');
const bot = require('./service/bot');
// // Замените 'YOUR_BOT_TOKEN' на токен вашего бота
// const token = process.env.BOT_KEY;
// const bot = new TelegramBot(token, { polling: true });

// const apiId = 19885697;
// const apiHash = "4108b17b21af25870b085739d4eb2b9a";
// // const stringSession = new StringSession(""); // fill this later with the value from session.save()
// // const stringSession = new StringSession("1AgAOMTQ5LjE1NC4xNjcuNTABu3c9bMORcXtR9v3qa782gFYclyMLhyGFfDKorfxHJJmItlrEdVBq3SYfldk+8+r2JSEicWcUA2EizvGmghBGrbbYMO1cbDnQPU5aCc2dgPlZvOlAqhPb3G18+YOxfY08tTIKPxiKkNWZHXZx7dDXkP+kgBaklIRrGoKkebycD7z7WH+sG8BB05e9bXIFN9kuq/tn5FHPzi8uII36nPrn2q4ZD53UwicemtAUXChQgmbucAnB0N1XzTUO7jmOyB1a3mljdnQC7QFyK5y3xylPAI7rTME39uwCA1RwdlaEaoHAKEykVhsmvr9gld1vQxzdqd/0akn/u9nDGH/AXwmI+zw="); // fill this later with the value from session.save()
// const stringSession = new StringSession("1AgAOMTQ5LjE1NC4xNjcuNDEBu1Bv6LtXADWQFNxw/YBbGu3csPoPKp29kHyd9wrM6tycfiEgn7IDTxy+g+6UgTqtS7uAKhPRdkz7frHRw8RldHePhK9sXi1Z7uKfQfFigrk5v9ayk3+wr0houFI9WA6jVP5LxQ/AZYZem3b7vvHHE9bjIIsCNvrq2knIq8COfESr42wu85/fCAlQsYUSWEUgp7Ct+d3EC+W6a78wfNBrIFiUqEZTnufbmDbQseXu2r3q1mHPnvpWnTcun2zXieBOLc2F/mSNr90HRmNBEaa/L4GZY1qX4Zn4CCbFwrAZzz1SPEOH/AblEB9Re0Xb3NirD+GGIZCsTnvWS3EYQhLK8Bo="); // fill this later with the value from session.save()


// const tgClient = new TelegramClient(stringSession, apiId, apiHash, {
//   connectionRetries: 5,
// });


//https://habr.com/ru/companies/selectel/articles/802629/

(async () => {
  // 
  // await client.start({
  //   phoneNumber: async () => await input.text("Please enter your number: "),
  //   password: async () => await input.text("Please enter your password: "),
  //   phoneCode: async () =>
  //     await input.text("Please enter the code you received: "),
  //   onError: (err) => console.log(err),
  // });
  // console.log("You should now be connected.");
  // console.log(client.session.save()); // Save this string to avoid logging in again
  // await client.sendMessage("me", { message: "Hello!" });
  // await client.sendMessage("me", { message: "Hello! тшпук" });


  // await tgClient.connect();



  await tgController.connectTgClient()



})();



bot.onText(/\/start/, async (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  // const username = msg.from.username;
  // console.log('msg', msg);

  // const user = {
  //   userId,
  //   username
  // }

  const response = await userController.createUser(msg)
  bot.sendMessage(chatId, response);
});

// const searchChats = async (searchQuery) => {
//   const result = await tgClient.invoke(
//     new Api.contacts.Search({
//       q: searchQuery,
//       limit: 10, // Максимальное количество результатов
//     })
//   );
//   return result
// }

// Обработка команды /start


// async function getUserByUsername(userId) {
//   try {
//     const res = await client.query('SELECT * FROM users WHERE telegram_id = $1', [userId]);
//     return res.rows; // Возвращает массив найденных пользователей
//   } catch (err) {
//     console.error('Error executing query', err.stack);
//   }
// }
// bot.onText(/\/getuser/, async (msg) => {
//   const userId = msg.from.id;
//   const chatId = msg.chat.id;
//   const username = msg.from.username;

//   console.log('msg', msg);


//   const rows = await getUserByUsername(userId)
//   bot.sendMessage(chatId, rows?.[0]?.username);
// });

// Обработка текстовых сообщений
// bot.on('message', async (msg) => {
//   console.log('msg', msg);

//   try {
//     const chatId = msg.chat.id;
//     // const searchChatsResult = await tgController.searchChats(msg.text)

//     //шлет смс
//     // tgController.sendMsg(msg.text)



//     // console.log('searchChatsResult', searchChatsResult);


//     // searchChatsResult.chats.forEach(i => {
//     //   bot.sendMessage(chatId, `t.me/${i.username}`);
//     // })
//   } catch (error) {
//     console.log('on message error', error);

//   }


// Если пользователь не ввел команду /start
// if (!msg.text.startsWith('/')) {
//   bot.sendMessage(chatId, 'Пожалуйста, используйте команду /start для регистрации.');
// }
// });

console.log('Бот запущен...');




const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Закрытие соединения с базой данных при завершении работы приложения
process.on('SIGINT', async () => {
  console.log('Closing database connection...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database connection...');
  await prisma.$disconnect();
  process.exit(0);
});