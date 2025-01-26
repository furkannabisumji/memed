import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import router from './routes/index.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use('', router);

// Initialize Telegram Bot
// new TelegramBotService();

app.listen(3001, () => {
  console.log('🚀 Server is running on port 3001');
  // console.log('🤖 Telegram bot is active');
});
