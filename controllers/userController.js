// const userService = require('../service/user-service');
// const { validationResult } = require('express-validator');
// const ApiError = require('../exceptions/api-error');

const { PrismaClient } = require('@prisma/client');
const userService = require('../service/userService');
const prisma = new PrismaClient();

// в сервисы засунуть функции поиска в бд, будет возможность дергать эти функции и из роутов при необходимости, и использовать как отдельную функцию
class UserController {
  async getAllUsers(req, res) {
    try {

      const users = await userService.getAllUsers()

      // console.log('xxxxxx', users);

      return res.json(users.map(i => ({ ...i, userId: i.userId.toString() })));
      // return res.json({ message: 'Hello from the server!' });
    } catch (e) {
      console.log(e);
    }
  }
  async createUser(msg) {
    try {
      const { id, is_bot, first_name, last_name, username, language_code } = msg.from
      const newUser = await userService.createUser({
        // userId: id,
        // username: username,
        userId: id,
        isBot: is_bot,
        firstName: first_name,
        lastName: last_name,
        userName: username,
        languageCode: language_code,
      });

      console.log('Пользователь добавлен:', newUser);
      return 'Пользователь добавлен'
    } catch (error) {
      console.error('Ошибка при добавлении пользователя:', error);
    } finally {
      await prisma.$disconnect();
    }
  }

  async getUser(req, res, next) {
    const userId = req.params.userId;
    console.log('get');
    const user = await userService.findUser({ userId })
    // const users = await prisma.user.findMany();
    res.json({ ...user, userId: String(user?.userId) });

  }

  async deleteUserChat(data) {
    const { userId, chatId } = data
    await prisma.user.updateMany({
      where: {
        id: userId,
        chats: {
          some: { id: chatId },
        },
      },
      data: {
        chats: {
          disconnect: { id: chatId },
        },
      },
    });
    return chat
  }

}


module.exports = new UserController();
