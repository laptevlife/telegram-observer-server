const express = require('express');
const userController = require('../controllers/userController');
const tgController = require('../controllers/tgController');

const router = express.Router();

router.get('/users', userController.getAllUsers);
router.get('/user/:userId', userController.getUser);
router.post('/find_chats', tgController.postFindChats);
// router.get('/get_user_chats', tgController.getUserChats);
router.post('/add_user_chat/:userId', tgController.postAddUserChat);
router.delete('/delete_user_chat/:userId/:chatId', tgController.deleteUserChat);
router.post('/create_chat_keyword/:userId/:chatId', tgController.createChatKeyword);
router.get('/get_chat_keywords', tgController.getChatWithKeywords);
router.delete('/delete_keyword', tgController.deleteChatKeyword);
// router.post('/', createUser);

module.exports = router;