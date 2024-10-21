// const UserModel = require('../models/user-model');
// const bcrypt = require('bcrypt');
// const uuid = require('uuid');
// const mailService = require('./mail-service');
// const tokenService = require('./token-service');
// const UserDto = require('../dtos/user-dto');
// const ApiError = require('../exceptions/api-error');


const { PrismaClient } = require('@prisma/client');
// const tgController = require('../controllers/tgController');
const prisma = new PrismaClient();

class UserService {

  async createUser(data) {
    const newUser = await prisma.user.create({
      data
    })
    return newUser
  }

  async getAllUsers() {
    console.log('getAll');
    const users = await prisma.user.findMany({
      include: {
        chats: {
          include: {
            keywords: true, // Включаем ключевые слова для каждого чата
          },
          // include: {
          //   keywords: {
          //     where: {
          //       userId: user.id, // Фильтруем ключевые слова по конкретному пользователю
          //     },
          //   },
          // },
        },
      }
    })

    // const users = await UserModel.find();
    return users;
  }
  async findUserByDbId(userDbId) {
    const user = await prisma.user.findUnique({
      where: { id: userDbId },
    })
    return user
  }
  async findUser(data) {
    try {
      const { userId } = data;
      const user = await prisma.user.findUnique({
        where: { userId },
      });
      const userWidthChatsData = await prisma.user.findUnique({
        where: { userId },
        // include: { chats: true, keywords: true },
        include: {
          chats: {
            // include: {
            //   keywords: true, // Включаем ключевые слова для каждого чата
            // },
            include: {
              keywords: {
                where: {
                  userId: user.id, // Фильтруем ключевые слова по конкретному пользователю
                },
              },
            },
          },
        },
        // include: { keywords: true },
      });
      return userWidthChatsData
    } catch (error) {
      throw new Error(error);

    }

  }
  async updateUser(data) {
    const { userId, id } = data;
    await prisma.user.update({
      where: { userId },
      data: {
        chats: {
          connect: { id: id },
        },
      },
    });
  }
  async addChat(data) {
    console.log('data!', data.chatId);

    const chat = await prisma.chat.create({
      data
    });
    return chat
  }
  async deleteUserChat(data) {
    const { userId, chatId } = data
    await prisma.user.update({
      where: { userId: BigInt(userId) },
      data: {
        chats: {
          disconnect: [{ id: parseInt(chatId) }],
        },
      },
    });

    // Удаляем сам чат
    // await prisma.chat.delete({
    //   where: { id: parseInt(chatId) },
    // });
  }
  async deleteChatKeyword({ keywordId, chatId, userId }) {
    // console.log('userId', userId);

    // tgController.stopObserve(userId)

    // console.log({ keywordId, chatId, userId });
    try {
      const keyword = await prisma.keyword.findUnique({
        where: { id: keywordId },
      });

      if (!keyword) {
        throw new Error('Keyword not found');
      }

      // console.log('keyword', keyword);
      // console.log('! ', +userId, +chatId);

      await prisma.keyword.delete({
        where: { id: keywordId },
      });


    } catch (error) {
      console.error(error);
    }

  }
  async createChatKeyword({ keyword, chatId, userId }) {
    // const { keyword, chatId } = req.body;

    try {
      const newKeyword = await prisma.keyword.create({
        data: {
          keyword,
          user: { connect: { id: +userId } },
          chat: { connect: { id: +chatId } },
        },
      });
      return newKeyword

      // res.status(200).json(newKeyword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка при добавлении ключевого слова' });
    }

  }

  findChat = async ({ chatId, chatIdDb }) => {
    try {

      const findBy = chatIdDb ? { id: chatIdDb } : { chatId: chatId }
      const chat = await prisma.chat.findUnique({
        // where: { chatId: chatId },
        where: findBy,
        // include: {
        //   keywords: true,
        // },

      });
      return chat
    } catch (error) {
      console.error(error);

    }
  }


  getChatWithKeywords = async ({ chatId, userId }) => {
    try {
      const chat = await prisma.chat.findUnique({
        where: { id: +chatId },
        include: {
          keywords: {
            where: {
              userId: +userId, // Фильтруем ключевые слова по конкретному пользователю
            },
          },
        },
      });
      return chat
      // const { userId } = data;
      // const user = await prisma.user.findUnique({
      // where: { userId },
      // include: { chats: true },
      // });
      // return user

      // res.status(200).json(newKeyword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка при добавлении ключевого слова' });
    }
  }

  getUserKeywords = async ({ userId, chatId }) => {
    try {
      // const keywords = await prisma.keyword.findMany({
      //   where: {
      //     userId: userId, // Фильтруем по userId
      //   },
      // });
      // return keywords

      const whereConditions = {
        ...(userId && { userId }), // Добавляем userId только если он определен
        ...(chatId && { chatId }), // Добавляем chatId только если он определен
      };

      const keywords = await prisma.keyword.findMany({
        where: whereConditions,
      });
      return keywords
    } catch (error) {
      console.error(error);

    }
  }
  getObservingChats = async () => {
    try {

      const allActiveToObserveChats = await prisma.chat.findMany({
        include: {
          keywords: true,
          users: true,
        },
      });
      const promiseAllChats = allActiveToObserveChats.map(async (chat) => {
        console.log();

        const usersWithKeywords = await Promise.all(chat.users.map(async (user) => {
          return {
            // ...chat,
            ...user,
            keywords: await this.getUserKeywords({ userId: user.id, chatId: chat.id })
            // users: {

            // }
          }
        }))
        return {
          ...chat,
          users: usersWithKeywords
        }
      })
      const promiseAllChatsRes = await Promise.all(promiseAllChats)


      // return allActiveToObserveChats
      return promiseAllChatsRes
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка при добавлении ключевого слова' });
    }
  }
}

module.exports = new UserService();
