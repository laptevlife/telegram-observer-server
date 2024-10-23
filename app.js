const express = require('express');
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser')
const errorMiddleware = require('./middlewares/errorMiddleware');
const router = require('./routes');

// const PORT = process.env.PORT || 5000;
const app = express()


const originUrl = `${process.env.CLIENT_URL}`

console.log('EEEEEE', originUrl);

app.use(express.json());
app.use(cookieParser());
// app.use(cors());
app.use(cors({
  credentials: true,
  origin: originUrl
  // origin: 'http://localhost:3000'
}));
app.use('/api', router);
app.use(errorMiddleware);

module.exports = app;