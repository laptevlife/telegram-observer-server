require('dotenv').config();

const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const tgService = require('../service/tgService');
const userService = require('../service/userService');
const TelegramBot = require('node-telegram-bot-api');

const { NewMessage } = require("telegram/events"); // Импортируйте NewMessage
// token = process.env.BOT_KEY;
// const token = process.env.BOT_KEY;
// const bot = new TelegramBot(token, { polling: true });

const bot = require('../service/bot');


const apiId = 19885697;
const apiHash = "4108b17b21af25870b085739d4eb2b9a";
// const stringSession = new StringSession(""); // fill this later with the value from session.save()
// const stringSession = new StringSession("1AgAOMTQ5LjE1NC4xNjcuNTABu3c9bMORcXtR9v3qa782gFYclyMLhyGFfDKorfxHJJmItlrEdVBq3SYfldk+8+r2JSEicWcUA2EizvGmghBGrbbYMO1cbDnQPU5aCc2dgPlZvOlAqhPb3G18+YOxfY08tTIKPxiKkNWZHXZx7dDXkP+kgBaklIRrGoKkebycD7z7WH+sG8BB05e9bXIFN9kuq/tn5FHPzi8uII36nPrn2q4ZD53UwicemtAUXChQgmbucAnB0N1XzTUO7jmOyB1a3mljdnQC7QFyK5y3xylPAI7rTME39uwCA1RwdlaEaoHAKEykVhsmvr9gld1vQxzdqd/0akn/u9nDGH/AXwmI+zw="); // fill this later with the value from session.save()
const stringSession = new StringSession("1AgAOMTQ5LjE1NC4xNjcuNDEBu1Bv6LtXADWQFNxw/YBbGu3csPoPKp29kHyd9wrM6tycfiEgn7IDTxy+g+6UgTqtS7uAKhPRdkz7frHRw8RldHePhK9sXi1Z7uKfQfFigrk5v9ayk3+wr0houFI9WA6jVP5LxQ/AZYZem3b7vvHHE9bjIIsCNvrq2knIq8COfESr42wu85/fCAlQsYUSWEUgp7Ct+d3EC+W6a78wfNBrIFiUqEZTnufbmDbQseXu2r3q1mHPnvpWnTcun2zXieBOLc2F/mSNr90HRmNBEaa/L4GZY1qX4Zn4CCbFwrAZzz1SPEOH/AblEB9Re0Xb3NirD+GGIZCsTnvWS3EYQhLK8Bo="); // fill this later with the value from session.save()


const tgClient = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

// const TelegramBot = require('node-telegram-bot-api');
// const bot = new TelegramBot(token, { polling: true });


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TgController {

  constructor() {
    this.handlers = []; // Массив для хранения обработчиков
  }

  connectTgClient = async () => {
    try {

      await tgClient.start({
        phoneNumber: async () => await input.text("Please enter your number: "),
        password: async () => await input.text("Please enter your password: "),
        phoneCode: async () =>
          await input.text("Please enter the code you received: "),
        onError: (err) => console.log(err),
      });
      console.log("You should now be connected.");
      console.log('client.session', tgClient.session); // Save this string to avoid logging in again
      console.log(tgClient.session.save()); // Save this string to avoid logging in again
      await tgClient.sendMessage("me", { message: "Hello!" });
      await tgClient.sendMessage("me", { message: "Hello! тшпук" });

      await tgClient.connect();
      await this.startObserve();
      // await this.startListenBot().call(this);

    } catch (e) {
      console.log(e);
    }
  }
  async sendMsg(text) {
    try {
      const user = await tgClient.getEntity('pal_olegych');
      tgClient.sendMessage(user, { message: text })

    } catch (e) {
      console.log(e);
    }
  }
  // async startListenBot() {
  //   try {
  //     return bot
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }


  async searchChats(searchQuery) {
    try {
      const result = await tgClient.invoke(
        new Api.contacts.Search({
          q: searchQuery,
          limit: 10, // Максимальное количество результатов
        })
      );
      return result
    } catch (e) {
      console.log(e);
    }
  }



  postFindChats = async (req, res, next) => {
    console.log('findChatsPost', req.body);

    try {
      const chatName = req.body.name
      const chatsResult = await this.searchChats(chatName)
      const newResult = {
        ...chatsResult,
        chats: chatsResult.chats.map(i => ({
          ...i, photo: tgService.createPhotoUrl(i.photo)
        }))
      }

      // return res.json(newResult);
      return res.json(chatsResult);
    } catch (e) {
      console.log('postFindchats', e);

      next(e);
    }
  }
  postAddUserChat = async (req, res, next) => {
    try {
      const userId = req.params.userId;

      const { id, className, accessHash, title, username, participantsCount, date } = req.body;
      console.log('chat body ', id, className, accessHash, title, username, participantsCount, date);

      const chatInBd = await userService.findChat({ chatId: id })
      let chat
      // console.log('chatinBd', chatinBd);
      if (!chatInBd) {
        chat = await userService.addChat({
          chatId: id,
          className,
          // classType,
          accessHash,
          title,
          username,
          participantsCount,
          date,
        })
        await this.startObserveWithNewData({ chat })
      } else {
        chat = chatInBd
      }

      await userService.updateUser({
        id: chat.id,
        userId: userId
      })


      console.log('Чат добавлен');

      res.json(JSON.stringify(chat));

    } catch (e) {
      // res.json(JSON.stringify(e));
      console.log('error', e);
      next(e);
    }
  }

  deleteUserChat = async (req, res, next) => {
    try {
      const { userId, chatId } = req.params;
      await userService.deleteUserChat({ userId, chatId })
      return res.json(200);
    } catch (e) {
      next(e);
    }
  }
  deleteChatKeyword = async (req, res, next) => {
    try {
      const { userId,
        chatId,
        keywordId } = req.body;
      const chat = await userService.findChat({ chatIdDb: +chatId })
      await this.stopObserve({ chat })
      console.log('CHATID', chatId);
      // const currentChat = await userService.getChatWithKeywords({ chatId })
      // console.log('currentChat', currentChat);

      await userService.deleteChatKeyword({ userId, chatId, keywordId })

      await this.startObserveWithNewData({ chat })
      return res.json(200);
    } catch (e) {
      next(e);
    }
  }
  createChatKeyword = async (req, res, next) => {
    try {
      const { userId, chatId } = req.params;
      const { keyword } = req.body;
      const chat = await userService.findChat({ chatIdDb: +chatId })
      await this.stopObserve({ chat })


      await userService.createChatKeyword({ keyword, userId, chatId })
      await this.startObserveWithNewData({ chat })

      return res.json(200);
    } catch (e) {
      next(e);
    }
  }
  getChatWithKeywords = async (req, res, next) => {
    try {
      const { userId, chatId } = req.query;
      const chat = await userService.getChatWithKeywords({ userId, chatId })
      return res.json(chat);
    } catch (e) {
      next(e);
    }
  }

  observeHandler = async (event, getObservingChats) => {
    console.log('OBSERVE');

    const peerId = event.originalUpdate.message.peerId.channelId.value
    const chatTo = getObservingChats.find(i => i.chatId == peerId)
    console.log('chatTo', chatTo);
    // console.log('chatToUsers', chatTo.users.map(i => {
    //   console.log('!Q!Q!', i.keywords);

    //   return i.keywords
    // }));

    const sendAllMessages = chatTo.users.map(async (user) => {
      console.log('!Q!Q!', user);

      if (user.keywords.length === 0) {

        return await bot.sendMessage(user.userId, event.message.message);
      }
    })

    await Promise.all(sendAllMessages)
      .then(results => {
        console.log('Все сообщения отправлены', results);
      })
      .catch(error => {
        console.error('Ошибка при отправке сообщений', error);
      });

    // console.log('chatToWords', chatTo.keywords);

    const sendMessages = chatTo.keywords.map(
      async (keyword) => {
        console.log('keyword.keyword.length ', keyword);

        if (event.message.message.toLocaleLowerCase().includes(keyword.keyword.toLocaleLowerCase() || chatTo.keywords.length === 0)) {

          console.log('!!!!', event.message.message.toLocaleLowerCase().includes(keyword.keyword.toLocaleLowerCase()));
          console.log('event.message.message.toLocaleLowerCase()', event.message.message.toLocaleLowerCase());
          console.log('keyword.keyword.toLocaleLowerCase()', keyword);

          const user = await userService.findUserByDbId(keyword.userId)
          return bot.sendMessage(user.userId, event.message.message);
        }
      }
    );

    await Promise.all(sendMessages)
      .then(results => {
        console.log('Все сообщения отправлены', results);
      })
      .catch(error => {
        console.error('Ошибка при отправке сообщений', error);
      });
  }


  startObserve = async () => {
    try {
      const getObservingChats = await userService.getObservingChats()
      await tgClient.getMe()
      const handler = (event) => this.observeHandler(event, getObservingChats);
      console.log('getObservingChats', getObservingChats);
      getObservingChats.forEach(chat => {
        this.handlers.push({ chats: [chat.chatId], handler });
        tgClient.addEventHandler(handler, new NewMessage({ chats: [chat.chatId] }))
      })
    } catch (error) {
      throw new Error(error);

    }
  }
  startObserveWithNewData = async ({ chat }) => {
    try {

      console.log('this.handlers START ', this.handlers);
      const getObservingChats = await userService.getObservingChats()
      const handler = (event) => this.observeHandler(event, getObservingChats);
      this.handlers.push({ chats: [chat.chatId], handler });
      tgClient.addEventHandler(handler, new NewMessage({ chats: [chat.chatId] }))
      console.log('this.handlers START END ', this.handlers);

      // this.handlers
      // const user = await userService.findUser({ userId })
      // console.log('USER', user);


      // // const allUsers = await userService.getAllUsers();
      // const getObservingChats = await userService.getObservingChats()
      // console.log('getObservingChats', getObservingChats.map(i => i.keywords));

      // await tgClient.getMe()
      // const handler = (event) => this.observeHandler(event, getObservingChats);
      // console.log('CHAT KEYWORDS', user.chats.map(i => i.keywords));

      // const chatsId = user.chats.map(i => i.chatId)
      // console.log('chatsIdRRRRRR', chatsId);
      // this.handlers.push({ userIdTg: user.userId, chatsId, handler });
      // tgClient.addEventHandler(handler, new NewMessage({ chats: chatsId }))
    } catch (error) {
      throw new Error(error);

    }
  }
  stopObserve = async ({ chat }) => {

    try {
      console.log('this.handlers Stop', this.handlers);

      this.handlers.forEach(({ chats, handler }) => {
        console.log('chatsId@', chats);
        if (chats[0] == chat.chatId) {
          tgClient.removeEventHandler(handler, new NewMessage({ chats: chats }));
          this.handlers = this.handlers.filter(i => i.chats[0] != chat.chatId)
        }

      });
    } catch (error) {
      console.log('error', error);

    }

    // this.handlers.forEach(({ chatsId, handler }) => {
    //   console.log('chatsId@', chatsId);
    //   tgClient.removeEventHandler(handler, new NewMessage({ chats: chatsId }));
    // });

    // const chat = await userService.findChat({ chatIdDb })



    // console.log(' handler.chatsId', handler.chatsId);

    // const filteredChats = this.handlers.filter(handler => {
    //   if (handler.userIdTg != userIdTgToDelete) {
    //     return true
    //   } else {
    //     tgClient.removeEventHandler(handler, new NewMessage({ chats: handler.chatsId }));
    //     return false
    //   }
    // })

    // console.log('filteredChats', filteredChats);
    // this.handlers = filteredChats; // Очищаем массив обработчиков


    // this.handlers.filter(({ userIdTg, chatsId, handler }) => {
    //   userIdTg
    //   tgClient.removeEventHandler(handler, new NewMessage({ chats: chatsId }));
    // });
  }

}


module.exports = new TgController();




// Новое сообщение в канале true_garbage: 👋
// Всем, привет

// Ищу человека для задачи по ротоскопу.

// 4️⃣шота.

// 👾Сложность средняя.

// ❗️Бюджет есть.

// ⏱️Время на работу плюс минус 4 дня.

// Начать нужно завтра утром.

// Пишите, пожалуйста, в лс с портфолио.
// Новое сообщение в канале true_garbage: А что именно интересует?