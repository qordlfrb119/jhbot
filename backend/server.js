import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors({
  origin: 'https://jhbot-bay.vercel.app', 
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

const quotes = JSON.parse(fs.readFileSync('./quotes.json', 'utf-8'));

// 오늘의 글
app.get('/api/daily', (req, res) => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ quote: randomQuote });
});

// 사용자 입력에 관계없이 랜덤 인용문 1개만 응답
app.post('/api/chat', (req, res) => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ reply: randomQuote });
});

app.listen(port, () => {
  console.log(`✅ 정회일 룰 기반 챗봇 서버 실행 중! 포트: ${port}`);
});


