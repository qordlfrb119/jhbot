const express = require('express');
const fs = require('fs');
const { OpenAI } = require('openai');
const createPrompt = require('../promptTemplate');

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// quotes.json 불러오기
const quotes = JSON.parse(fs.readFileSync('./quotes.json', 'utf8'));

// 키워드가 포함된 문장 최대 3개 추출
function getQuotesByKeyword(keyword, limit = 3) {
  const filtered = quotes.filter(q => q.text.includes(keyword));
  return filtered.slice(0, limit);
}

router.post('/chat', async (req, res) => {
  const { message } = req.body;

  // 1. 키워드 뽑기 (간단히 사용자 메시에서 단어 하나 사용)
  const keyword = message.trim().split(' ')[0]; // 예시: 첫 단어 사용

  const matchedQuotes = getQuotesByKeyword(keyword);

  if (matchedQuotes.length === 0) {
    return res.status(404).json({ error: '관련된 문장을 찾을 수 없습니다.' });
  }

  // 2. 프롬프트 생성 - 1~3개 문장 연결
  const combinedText = matchedQuotes.map(q => `"${q.text}" (📘 ${q.page}쪽)`).join('\n\n');
  const prompt = createPrompt(message, combinedText);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '너는 정회일 작가의 책 원문을 중심으로, 공감과 이해를 덧붙이는 감성 챗봇이야. 네 의견은 없어도 돼. 문장을 해석해주기만 해.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply, sources: matchedQuotes });
  } catch (error) {
    console.error('GPT 응답 오류:', error);
    res.status(500).json({ error: 'GPT 응답 실패' });
  }
});

module.exports = router;
