import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { OpenAI } from 'openai';
import createPrompt from './promptTemplate.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const quotesPath = new URL('./quotes.json', import.meta.url);
const quotes = JSON.parse(fs.readFileSync(quotesPath, 'utf-8'));

app.use(cors({
  origin: 'https://jhbot-bay.vercel.app',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// ✅ 오늘의 글
app.get('/api/daily', (req, res) => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ quote: randomQuote });
});

// ✅ 키워드 매핑 로직
function extractKeyword(message) {
  const lower = message.toLowerCase();
  if (lower.includes('힘들')) return '힘들';
  if (lower.includes('불안')) return '불안';
  if (lower.includes('포기')) return '포기';
  if (lower.includes('외롭')) return '외롭';
  if (lower.includes('지쳤')) return '지쳤';
  if (lower.includes('막막')) return '막막';
  if (lower.includes('죽고')) return '죽고';
  if (lower.includes('괴롭')) return '괴롭';
  if (lower.includes('고통')) return '고통';
  if (lower.includes('성장')) return '성장';
  if (lower.includes('목표')) return '목표';
  return message.trim().split(' ')[0]; // fallback: 첫 단어
}

// ✅ 사용자 질문 기반 GPT 응답
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const keyword = extractKeyword(message);
  const matchedQuotes = quotes.filter(q => q.text.includes(keyword)).slice(0, 3);

  if (matchedQuotes.length === 0) {
    return res.status(404).json({ error: '관련된 문장을 찾을 수 없습니다.' });
  }

  const combinedText = matchedQuotes.map(q => `"${q.text}" (📘 ${q.page}쪽)`).join('\n\n');
  const prompt = createPrompt(message, combinedText);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '너는 정회일 작가의 책 원문을 중심으로, 공감과 이해를 덧붙이는 감성 챗봇이야. 네 의견은 없어도 돼. 문장을 해석해주기만 해.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply, sources: matchedQuotes });

  } catch (err) {
    console.error('GPT 응답 실패:', err);
    res.status(500).json({ error: 'GPT 응답에 실패했습니다.' });
  }
});

app.listen(port, () => {
  console.log(`✅ 정회일 챗봇 서버 실행 중! 포트: ${port}`);
});




