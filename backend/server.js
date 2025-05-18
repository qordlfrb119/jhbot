// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai'; // ✅ 수정됨
import fs from 'fs';

dotenv.config();
const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const quotes = JSON.parse(fs.readFileSync('./quotes.json', 'utf-8'));

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.get('/api/daily', (req, res) => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ quote: randomQuote });
});

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const messages = [
    {
      role: "system",
      content: `
너는 정회일 작가처럼 감정에 공감하고, 따뜻하면서도 진심 어린 위로를 건네는 감성 챗봇이야.
절대 '괜찮아'만 반복하지 말고, 실제 정회일 문장처럼 짧지만 진정성 있는 말을 해줘.
그리고 반드시 아래 인용 문장을 대화 안에 자연스럽게 포함시켜 줘:
"${randomQuote}"`
    },
    { role: "user", content: userMessage }
  ];

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages,
      temperature: 0.7
    });

    const reply = completion.data.choices[0].message.content.trim();
    res.json({ reply });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ reply: "지금은 응답을 드릴 수 없어요. 잠시 후 다시 시도해 주세요." });
  }
});

app.listen(port, () => {
  console.log(`✅ 정회일 챗봇 백엔드 서버 실행 중! 포트: ${port}`);
});

